# Best practices for security

Two-factor authentication security has become in vogue for a reason: If one lock for your security is compromised, is there a second lock on the vault?  It might be reasonable to extend this metaphor to your infrastructure…If any of your servers were to go offline, would your services continue to provide data? Like, say, a literal nuclear bomb hit your service provider.  Would you be ok?  Would your security still be sound if your internal .env file is exposed to the public?  Do you have safeguards in place?

I was recently the target of a .env file attack.  We had a PHP server that had a .env file with a SendGrid API key in the file. The client wanted to rebrand, so we created a .MyOtherDomain.env file on the server.  But we soon discovered (due to a hack) that our API key was exposed.UGG!  We never tested public access to our .MyOtherDomain.env file. In an email phishing attack, 50,000 emails from our domain were sent to a Portuguese clientele. It was embarrassing.  However, the attack taught us that we needed to 2-Factorize our API keys. We needed to not only have the API Key but also to require access to the server to match our specific IP address ranges.

This guide is not meant to be comprehensive for a reason: If every sys-admin followed the same methods, we’d all be more vulnerable to attack.  Just look at WordPress: WordPress sites compromise 30 percent of all websites, but I'd wager they represent much more significant than 30% of all hacking attacks since WordPress sites, as a whole, are a huge target.  This document is to implore to to be different in the method you provide Two-Factor-authentication to all the services you expose to the internet at large.  

We recognize you don't have a whole team to test your methods, so we've offered our best advice in this guide, and we welcome your input to improve this guide.

The best security recommendations are: If, say, your database were compromised, would you have a backup? If multiple nuclear bombs hit the Eastern U.S. seaboard, would you still have your data?  

The founding philosophy of the Internet—if one node goes down, there's always a backup—should also apply to your security and infrastructure principles.

There is no one guide for this—the purpose is to be different in your backup and security implementations, lest you become a large target like Wordpress, and follow the principles of TWO-FACTOR.

You should be able to answer the following questions affirmatively:

- Was my API Key was stolen? No problem. I have IP key restrictions in place. 
- Database hacked? No problem. All secret data was not saved in plain text; it was encrypted.
- .env vars discoverd? No problem.  You need another second key or IP Address to access the data anyway.
- Oh wow, they have my secret key?  Well, they'd need my secret APP key as well, and both would need to be confirmed by a third party.
- My service got hit by millions of users all at once: who cares? We have auto-scaling and rate limitations in place

Say, your super secret API key becomes known.  Have a backup: The hacker with your API Key would also need to be IP restricted to your server to be effective.  Consider every route into to be TWO-FACTOR-AUTHENTICATED.

The Stipe team has an identical infrastructure in dev mode to pre-test any change in production mode.  They have regular drills where a server goes down, if popularity spikes, or if an API leaks to ensure data is secure, authorized, and available.  Due to these drills, on Black Friday, their server load never went above 5%.   If any element of their infrastructure gets nuked (by like an nuclear bomb), they have tested their fail-backs and they have a plan in place.  This level of reliability can cost millions of dollars.  But we hope this guide can direct you to a level of security and reliability that may only cost a few tens of dollars each month.   This becomes expensive as you get to the 99.999% of reliability, but it can be common place to get to the 99.999% of security.  
