import { createProxyMiddleware } from 'http-proxy-middleware';

// This proxy route will allow you to change the cors headers of any API you need to request within your Stripe APP.
// This example route shows how to proxy requests to https://dummyjson.com
// This is perhaps a bad choice for an example since DummyJson.com allows CORS.
// For example, rather than fetching https://dummyjson.com/products in your Stripe APP,

// you would fetch https://YOUR_DOMAIN_OR_LOCALHOST/api/dummyjson/products

export const dummyJsonProxy = createProxyMiddleware({
  target: 'https:/dummyjson.com', // target host with the same base path
  changeOrigin: true,
  autoRewrite:true,
  pathRewrite: {
    ['^/api/dummyjson']: '',
},
});