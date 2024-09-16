import cors from "cors";
import express from "express";


import auth from "./auth/auth";
import userSettings from "./routes/user-settings";

import stripeWebhook from './routes/webhooks/stripe-webhook'
import email from "./routes/email";
import warehouses from "./routes/warehouses";
import shipments from "./routes/shipments";
import tax from "./routes/tax-settings";
import publicRoutes from './routes/public'
import { dummyJsonProxy } from "./routes/proxy";
const app = express();

app.use(cors({
  credentials: true,
  origin: '*',
  optionsSuccessStatus: 200,
}));

// Add proxy routes here

app.use('/api/dummyjson', dummyJsonProxy);
app.use('/api/webhooks', stripeWebhook);

// IMPORTANT:  Proxy Routes must come before app.use(express.json());

app.use(express.json());

app.use('/api/settings', userSettings);
app.use('/api/warehouses', warehouses);
app.use('/api/shipments', shipments);
app.use('/api/auth', auth);
app.use('/api/email', email);
app.use('/api/tax', tax);
app.use('/api', publicRoutes);

export default app;
