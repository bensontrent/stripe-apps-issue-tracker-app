import "source-map-support/register";
import express, { Handler, Router, Request } from "express";
import axios, { AxiosError } from "axios";
import { Stream } from "stream";
import { Stripe } from "stripe";
import * as date from "date-fns";
import redisClient from "../services/redis";

const router: Router = express.Router();

// Use your Stripe API key here
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2023-08-16",
});




type TokenSet = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires: Date;
};

// Replace these with the information for your auth server
const LOGIN_URI = `https://${process.env.AUTH_HOST}/authorize`;
const LOGOUT_URI = `https://${process.env.AUTH_HOST}/v2/logout`;
const TOKEN_URI = `https://${process.env.AUTH_HOST}/oauth/token`;
const USERINFO_URI = `https://${process.env.AUTH_HOST}/userinfo`;


/**
 * Here we extract the session key used. Because we cannot use cookies to set a secure session id, the
 * only thing we can rely on is stripe's user and account IDs. These will be possible to securely verify
 * using a signed header once this is implemented in the Stripe apps SDK (see https://stripe.com/docs/stripe-apps/build-backend#authenticate-ui-to-backend)
 */
export const verifyCaller: Handler = (req, res, next) => {

  try {
    const sig = req.headers["stripe-signature"];
    const userId = req.headers["stripe-user-id"];
    const accountId = req.headers["stripe-account-id"];
    const devKey = req.headers["x-dev-key"];

    !devKey ? verifyUser(userId, accountId, sig) : verifyDev(devKey)

    res.locals.sessionId = `${userId}----${accountId}`;
    next();
  } catch (e) {
    res.sendStatus(418);

  }
};


// It is not recommended to allow the use of dev keys in hosted environments, it's essentially a back door that could be brute force-hacked
// To make dev keys secure enough to add in production add another header with a username or token that can be confirmed for access using your auth server
// Firebase auth may be a simple solution
const verifyDev = (devKey: unknown) => {

  if (process.env.mode === 'production') {
    

    throw new Error("Can't use dev keys in production");
  }

  if (
    !(
      typeof devKey === "string" &&
      devKey === process.env.PARCELCRAFT_WEBHOOK_SECRET_FOR_EASYPOST
    )
  ) {
    throw new Error("Missing dev signature");
  }
}

const verifyUser = (userId: unknown, accountId: unknown, sig: unknown) => {
  if (
    !(
      typeof userId === "string" &&
      typeof accountId === "string" &&
      typeof sig === "string"
    )
  ) {
    throw new Error("Missing user identifiers");
  }
  stripe.webhooks.signature.verifyHeader(
    JSON.stringify({
      user_id: userId,
      account_id: accountId,
    }),
    sig,
    // The app's secret in your app settings page in the Developers Dashboard
    process.env.APP_SECRET!
  );
};

/**
 * Here we use the authorization code provided in the auth callback to fetch and store access, id, and refresh tokens.
 * These will allow us to call the API on behalf of the user.
 */
const fetchToken = async (
  sessionId: string,
  code: string
): Promise<TokenSet> => {
  const queryParams = new URLSearchParams({
    grant_type: "authorization_code",
    // You will need to load your client ID and secret from your auth configuration
    // using whatever secret management process is appropriate for your infrastructure
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uri: "https://api.parcelcraft.com/api/auth/callback/logged-in",
    code,
  });
  const response = await axios.post(TOKEN_URI, queryParams, {
    responseType: "json",
  });
  const { expires_in, ...tokens } = response.data;
  const token = {
    ...tokens,
    expires: date.addSeconds(Date.now(), expires_in),
  };
  await redisClient.set(sessionId, JSON.stringify(token));
  return token;
};

/**
 * Here we fetch a new access token using a stored refresh token. Access tokens often cannot be revoked, so they have]
 * a short expiry. However, to avoid the user having to log in again we can re-authorize using a refresh token, which
 * if it has not been revoked will give us a new access token.
 */
const refreshToken = async (
  sessionId: string,
  refreshToken: string
): Promise<TokenSet> => {
  const queryParams = new URLSearchParams({
    grant_type: "refresh_token",
    // You will need to load your client ID and secret from your auth configuration
    // using whatever secret management process is appropriate for your infrastructure
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    refresh_token: refreshToken,
  });
  const response = await axios.post(TOKEN_URI, queryParams, {
    responseType: "json",
  });
  const { expires_in, ...tokens } = response.data;
  const token: TokenSet = {
    refresh_token: refreshToken, // if the response does not include a new refresh token, we keep the one we have
    ...tokens,
    expires: date.addSeconds(Date.now(), expires_in),
  };
  await redisClient.set(sessionId, JSON.stringify(token));
  return token;
};

/**
 * This is the URL that will be opened in a separate tab by the app. It will redirect to the OAuth authorization server's login page
 */
router.get("/login", (req, res) => {
  const { state } = req.query;

  if (typeof state !== "string") {
    res.sendStatus(401);
  } else {
    const queryParams = new URLSearchParams({
      audience: "https://api.parcelcraft.com",
      response_type: "code",
      client_id: process.env.CLIENT_ID!,
      redirect_uri: "https://api.parcelcraft.com/api/auth/callback/logged-in",
      state,
      scope: "offline_access openid profile email",
    });
    res.redirect(303, `${LOGIN_URI}?${queryParams.toString()}`);
  }
});

/**
 * Once the user has given the OAuth server their consent, they will be redirected to this path. The URL
 * will contain a code that can be exchanged for tokens and a state parameter that allows us to associate
 * them with the user's original request.
 */
router.get("/callback/logged-in", async (req, res) => {
  const { state, code } = req.query;
  if (
    typeof state !== "string" ||
    !state ||
    typeof code !== "string" ||
    !code
  ) {
    res.sendStatus(400);
  } else {
    await redisClient.set(state, code);
    res.send(
      "Successfully authenticated. Please close this tab to return to Stripe."
    );
  }
});

/**
 * To log out from the auth server and thus revoke the refresh token we must redirect to it
 */
router.get("/logout", (req, res) => {
  res.redirect(303, LOGOUT_URI);
});

/**
 * Deleting the tokens stored in session must be a separate call from logout, since logout redirects
 * are not signed, so we have no way of verifying the user on this server.
 */
router.delete("/session", verifyCaller, async (req, res) => {
  await redisClient.del(res.locals.sessionId);
  res.sendStatus(204);
});

/**
 * Here we receive a signed request from the app that associates our known state key with
 * a session ID. With this information we can fetch and save the user's tokens.
 */
router.get("/verify", verifyCaller, async (req, res) => {
  const { state } = req.query;
  if (typeof state !== "string") {
    res.sendStatus(400);
    return;
  }
  const code = await redisClient.get(state);
  if (!code) {
    res.sendStatus(401);
    return;
  }
  await redisClient.del(state);
  fetchToken(res.locals.sessionId, code)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((error: AxiosError) => {
      if (error.response) {
        console.error(error);
        res.sendStatus(401);
      } else {
        res.status(503).send("Cannot contact authentication server");
      }
    });
});

/**
 * This is an example of calling a protected API. We fetch the access token from our cache, renewing it with the
 * refresh token if it is expired, and use it to make a request on behalf of the user.
 *
 * Another approach to calling protected APIs would be to have an API that the frontend could use to fetch the access
 * token, which it would then use to contact the APIs directly. This is less secure but should still be acceptable since
 * access tokens are only valid for a short period of time and the server would still control the refresh mechanism.
 */
router.get("/userinfo", verifyCaller, async (req, res) => {
  try {
    let tokenSet = await redisClient.get(res.locals.sessionId);
    if (tokenSet) {
      let token = JSON.parse(tokenSet) as TokenSet
      if (token.expires < new Date()) {
        token = await refreshToken(res.locals.sessionId, token.refresh_token);
      }
      const response = await axios.get<Stream>(USERINFO_URI, {
        responseType: "stream",
        headers: {
          authorization: `${token.token_type} ${token.access_token}`,
        },
      });
      res.status(response.status);
      response.data.pipe(res);
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(503);
  }
});

export default router;