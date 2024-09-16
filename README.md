# Example production app for Stripe apps

This project aims to provide an example Stripe App to solve issues not explicitly stated in the Stripe Apps documentation.

## In this example, you will

- Create a private API to handle saving a Stripe user's or company-wide settings
- Handle Stripe Test Mode vs Live Mode, as well as support for separate settings in Stripes Sandboxes
- Create a safe way to push to production by implementing development and production environments
- Understand best security practices.
- Create an off-Stripe dashboard to handle additional feature, billing, and user authentication for your app.

## How we anticipate you'll use this tutorial

- While you're developing your app, we demonstrate how to use free services (database and hosting)
- We provide instructions on how to upgrade your services to ensure the highest levels of security

## Best practices in security

- While you're developing your app, we don't follow the best practices in security.  But as you graduate your app to production, this guide will give you the best practices to secure your app.  In our opinion, the best practice in security requires a negative response to this one question:  If any API key, route, .env file were hacked, would this one failure enable a hacker to gain access to secret user data?
- For example, this guide starts at a 1-factor authentication level, say with an API Key to gain access to critical systems.  2-Factor security means: Having an API key alone would be useless.  There's some other 2nd-factor in your authentication, it could be another token, an IP address restriction, or something else inventive.

## Best practices for reliablity

- Ensure if any server is down, your app continues to function
