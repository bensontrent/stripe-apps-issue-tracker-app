import axios from "axios";
import express, { Router, Request, Response } from "express";
import { IAddressCreateParameters, CarrierMetadata, IError } from "@easypost/api";


const router: Router = express.Router();


export type MetaDataResponse = {
  error?: IError
  carriers?: CarrierMetadata[]
}

type ApiKeyResponse = {
  error?: IError
  carriers?: CarrierMetadata[]
}


type BodyTypes = IAddressCreateParameters | undefined;

const getConfig = (apiKey:string, req: Request, method: 'get' | 'post' = 'get', url: string, body: BodyTypes = undefined) => {

  const config = {
    method: method,
    maxBodyLength: Infinity,
    url: `https://api.easypost.com/v2/${url}`,
    auth: {
      username: apiKey,
      password: '',
    },
    data: ''
  };
  if (body) {
    config.data = JSON.stringify(body);
  }
  return config
}


const getCarrierMetadata = async (req: Request, res: Response) => {
  const apiKey = req.header('x-api-key') as string || req.query.key as string;

  let query = '';
  const carriers = req.query.carriers;
  if (carriers) {
    query = `&carriers=${carriers}`
  }
  if (apiKey) {
    const config = getConfig(apiKey,req,  'get', `/metadata/carriers?types=service_levels,predefined_packages${query}`)
    const response = await axios.request(config)
    res.send(response.data);
  } else {
    res.send({error: {message: 'No API Key'}})
  }
}


// export async function createAddress(apiKey: string, body: IAddressCreateParameters): Promise<MetaDataResponse> {
//     const apiKey = req.header('x-api-key');
//   const config = getConfig(apiKey, 'post', 'addresses/create_and_verify', body)
//   const response = await axios.request(config)
//   return response.data
// }

// export async function getApiKeys(apiKey: string): Promise<MetaDataResponse> {
//     const apiKey = req.header('x-api-key');
//   const config = getConfig(apiKey, 'post', 'addresses/create_and_verify')
//   const response = await axios.request(config)
//   return response.data
// }




router.get("/metadata/carriers", getCarrierMetadata)


export default router;