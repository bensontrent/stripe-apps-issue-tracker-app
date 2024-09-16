import { Redis } from "ioredis"
import { Request } from "express";


const redisClient = new Redis({
  password: process.env.REDIS_PASSWORD,
  username: "default",
  host: process.env.REDIS_URL,
  port: 17377

});

export default redisClient;


export type IRedisKey = {
  warehouse: string;
  tax: string;

  // merged to same object as account settings at cache request so only two cache objects need fetching
  user: string;

  // this includes tax and warehouse settings but no user settings
  // any user may update the account settings, at that time, warehouse, tax, accountOncache need to be deleted

  account: string;
  // only account settings, no user settings
  accountOnly: string

}

export const getRedisKeys = (req: Request): IRedisKey => {

  const userId = req.headers["stripe-user-id"] as string || "test";
  const accountId = req.headers["stripe-account-id"] as string || "test";
  const mode = req.headers["stripe-mode"] as string || "test";

  const test = mode === 'test' ? "test" : '';
  return {
    warehouse: accountId + "warehouse" + test,
    tax: accountId + "tax" + test,
    user: accountId + userId + test,
    account: accountId + test,
    accountOnly: accountId + test + 'only'
  }
}