# Example production app for Stripe apps

This project aims to provide an example Stripe App to solve issues not explicitly stated in the Stripe Apps documentation.

- Includes a pattern for creating a private API to handle saving a Stripe user's or company-wide settings
- Includes a pattern on how to handle Stripe Test Mode vs Live Mode, as well as support for separate settings in Stripes Sandboxes
- Includes a pattern to demonstrate how to implement development and production environments
- Includes recommendations for best security practices.

** How we anticipate you'll use this tutorial

- While you're developing your app, we demonstrate how to use free services (database and hosting)
- We provide instructions on how to upgrade your services to ensure the highest levels of security

Best practices in security

- While you're developing your app, we don't follow the best practices in security.  But as you graduate your app to production, this guide will give you the best practices to secure your app.  In our opinion, the best practice in Security requires a negative response to this one question:  If any API key, route, route, or database were hacked, would this one failure enable a hacker to gain access to secret user data?
- For example, this guide starts at a 1-factor authentication level, say with an API Key to gain access to critical systems.  2-Factor security means: Having an API key alone would be useless.  There's some other 2nd-factor in your authentication, it could be another token, an IP address restriction, or something else inventive. 

In this guide:

- You'll create a database
- Devise your own schema
- Create an API your Stripe app can query
- Add a Redis server for caching
- Add a method for an off-Stripe dashboard to add authentication, billing for your app, or additional functionality.


## Add a new Supabase project

![image](https://github.com/user-attachments/assets/56b14155-527f-4061-a682-e5d57c2e4c31)

Copy `.env.example` and rename it to `.env.local`

Copy your supabase URL and your service role API key and fill the corresponding values into your .env.local

Fill in your Supabase URL and Supabase Service Key

![image](https://github.com/user-attachments/assets/fb17e743-193c-4367-887e-2a01d4d781b4)
