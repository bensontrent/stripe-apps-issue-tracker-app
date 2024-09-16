import {  getAllCountries, getAllCurrencies, getPlaceById, getStateByCountry, suggestAddress } from "../services";
import redisClient from "../services/redis";

import express, { Router, Request, Response } from "express";

const router: Router = express.Router();


  router.get("/countries", async (req: Request, res: Response) => {
  
    const cacheResults = await redisClient.get('countries');
    let countries;
    let cached = true;
    if (cacheResults) {
      countries = JSON.parse(cacheResults);
    } else {
      cached = false;
      countries = await getAllCountries();
      await redisClient.set('countries', JSON.stringify(countries));
    }
    res.set("Cache-Control", "s-maxage=360000, stale-while-revalidate=590");
    if (!countries.error) {
      res.json({ cached: cached, error: false, data: countries.data })
    } else {
      res.json({ cached: cached, error: true, data: countries.data })
    }
  })
  
  router.get("/currencies", async (req: Request, res: Response) => {
    const currencies = await getAllCurrencies();
    res.json({ error: false, data: { currencies } })
  })
  

  
  router.get("/states/:iso2", async (req: Request, res: Response) => {
  
    const countryCode = req.params.iso2;
    const cacheResults = await redisClient.get(countryCode);
    let states;
    let cached = true;
    if (cacheResults) {
      states = JSON.parse(cacheResults);
    } else {
      cached = false;
      states = await getStateByCountry(countryCode);
      await redisClient.set(countryCode, JSON.stringify(states));
    }
    if (!states.error) {
      res.set("Cache-Control", "s-maxage=360000, stale-while-revalidate=590");
      res.json({ cached: cached, error: false, data: states.data });
    } else {
      res.json({ cached: false, error: true, data: null });
    }
  
  })
  
  
  router.post("/suggest", async (req: Request, res: Response) => {
    const { address } = req.body;
    if (address) {
      //res.json({ error: true, message:apiKey })
      suggestAddress(address, res);
    } else {
      res.json({ error: true, message: "No API Key" })
    }
  })
  
  router.get("/suggest/:placeId", async (req: Request, res: Response) => {
    const placeId = req.params.placeId;
  
    if (placeId) {
  
      getPlaceById(placeId, res);
    } else {
      res.json({ error: true, message: "No Place Id" })
    }
  })

  export default router;