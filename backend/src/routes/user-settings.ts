
import express, { Router, Request, Response, NextFunction } from "express";
import supabase from "../services/supabase";
import redisClient, { getRedisKeys } from "../services/redis";
import { verifyCaller } from "../auth/auth";
const router: Router = express.Router();


type GetRedisReturn = {
  warehouse: string;
  tax: string;
  user: string;
  account: string;

}


export async function createUserSettings(customerId: string, settings: string) {

  if (supabase) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ id: customerId, settings: settings }, { onConflict: 'id' })
      .select()

    return { error: error, settings: data && data.length > 0 ? data[0].settings : null }
  } else {
    return { error: true }
  }

}


async function fetchSettingsById(id: string) {



  if (!!supabase) {
    const { data: settings, error } = await supabase
      .from('settings')
      .select("*")
      .eq('id', id)

    if (error) {
      return {}
    }
    else {
      return settings.length > 0 ? settings[0].settings : {}
    }
  }
  else {
    return {};
  }
}

async function tryCachedSettings(req: Request, res: Response, next: NextFunction) {
  const userId = req.params.id;
  let results;
  try {
    const accounts = getRedisKeys(req)

    const cachedResults = await redisClient.get(userId.includes("usr_") ? accounts.user : accounts.accountOnly);


    if (cachedResults) {
      results = JSON.parse(cachedResults);

      res.send({
        fromCache: true,
        data: results,
      });
    } else {
      getSettings(req, res)
    }
  } catch (error) {
    console.error(error);
    res.status(404);
  }
}

async function getSettings(req: Request, res: Response) {
  const userId = req.params.id;
  const accounts = getRedisKeys(req)

  try {
    const results = await fetchSettingsById(userId);

    res.send({
      fromCache: false,
      data: results,
    });

    await redisClient.set(userId.includes("usr_") ? accounts.user : accounts.accountOnly, JSON.stringify(results));
  } catch (error) {
    console.error(error);
    res.status(404).send({
      fromCache: false,
      error: error,
      data: null,
    });
  }
}

const patchUserSettings = async (req: Request, res: Response) => {
  try {
    const { id, settings } = req.body;
    const results = await fetchSettingsById(id);

    let mergedSettings = {
      ...results as Object,
      ...settings
    };

    const data = await createUserSettings(id, mergedSettings);

    res.send({
      fromCache: false,
      data: data
    });

    const accounts = getRedisKeys(req)

    if (id.includes("usr_")) {
      redisClient.del(accounts.user)
    } else {
      redisClient.del(accounts.account, accounts.accountOnly)
    
    }

  } catch (error) {
    console.error(error);
    res.status(404).send({
      fromCache: false,
      error: error,
      data: null,
    });
  }
}



const getAllSettings = async (account: string, user: string) => {
  if (!!supabase) {
    const { data: settings, error } = await supabase
      .from('settings')
      .select("*")
      .in('id', [account, user])

    if (error) {
      return null
    } else {
      return settings
    }

  } else {
    return null
  }
}


const getCustomerAndAccountSettings = async (req: Request, res: Response) => {
  const accountId = req.params.account;
  const userId = req.params.user;

  const redisKeys = getRedisKeys(req)
  try {


    const settings = await  getAllSettings(accountId, userId)


    if (settings && settings.length > 0) {

      let mergedSettings = settings.reduce((accum: { [key: string]: any }, current: any) => {
        return { ...accum, ...current.settings }
      }, {})

      const results = {
        error: false,
        settings: mergedSettings,

      }

      res.send(results);
      await redisClient.set(redisKeys.user, JSON.stringify(results))

    } else {
      res.send({
        error: false,
        settings: {},
        taxes: [],
        warehouses: []
      });
    }
  }
  catch (error) {
    console.error(error);

    res.send({
      error: error,
      data: null,
      taxes: null,
      warehouses: null
    });
  }
}



router.get("/:id", verifyCaller, tryCachedSettings);
router.get("/:account/:user", verifyCaller, getCustomerAndAccountSettings);
router.patch("/", verifyCaller, patchUserSettings);


export default router;