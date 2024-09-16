const { Stripe } = require("stripe");
let stripe = new Stripe(process.env.STRIPE_API_KEY);


import express, { Router, Request, Response  } from "express";



const router: Router = express.Router();


router.post(
  // This path will receive all webhooks from connected accounts once it's added via the dashboard.
  "/stripe",
  express.raw({ type: "application/json" }),
  (request: Request, response: Response) => {
    const sig = request.headers['stripe-signature'];
    // this.logService.debug(`StripeWebhookController.processStripeWebhook: Invoked, stripe-signature: ${sig}, req.body: ${req.body}`);
    
    let event
    const body = JSON.parse(request.body);
    
    try {
    
      event = stripe.webhooks.constructEvent(
        request.body,
        sig!,
        body.livemode === false ? process.env.STRIPE_WEBHOOK_SECRET_TEST_MODE! : process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (e) {
      const error = e as Error;
      response.status(400).send(`Webhook Error: ${error.message} ${body.livemode === false ? 'test' : 'test'}`);
      return;
    }
    
    
    if (body.livemode === false) {
     stripe = new Stripe(process.env.STRIPE_API_KEY_TEST_MODE!);
    }
    
    
    // this.logService.debug(`StripeWebhookController.processStripeWebhook: Stripe Event: ${JSON.stringify(event)}`);
    
    try {
      switch (event.type) {
        case 'account.application.authorized':
          // Or do something meaningful, like send a welcome email to the user
          respondWithSuccess(event.type, response);
          break;
        // The "deauthorized" event will get sent when an account uninstalls the App
        case 'account.application.deauthorized':
          respondWithSuccess(event.type, response);
          break;
        case 'invoice.created':
          respondWithSuccess(event.type, response);
          break;
        case 'invoice.finalized':
          respondWithSuccess(event.type, response);
          break;
    
        default:
        respondWithSuccess(event.type, response);
        break;
      }
      response.json({
        received: true,
        livemode: body.livemode
      });
    } catch (e) {
      const error = e as Error;
      if (error.message.includes('No such invoice')) {
        response
          .status(200)
          .send(`Invoice was deleted. Nothing more to do here: ${error.message}`);
      } else {
        response.status(400).send(`Webhook Error: ${error.message}`);
      }
    }

    response.json({ received: true });
  }
);

const respondWithSuccess = (type: string, res: Response) => {
  res.json({
    type: type,
    received: true
  });
};

export default router;





