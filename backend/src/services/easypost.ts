import { Webhook } from "@easypost/api";
import axios from "axios";
import {parcelcraftEncrypt} from "../auth/crypto"


type CreateWebhookBody = {
    webhook: {
        url: string;
        webhook_secret?: string
    }
}


type BodyTypes = CreateWebhookBody | undefined;

type AxiosConfig = {
    method: "get" | "post" | "patch";
    maxBodyLength: number;
    url: string;
    headers: {
        'Content-Type': string;
    };
    auth: {
        username: string;
        password: string;
    };
    data: string;
}

const getConfig = (apiKey: string, method: "get" | "post" | "patch" = "get", url: string, body: BodyTypes = undefined): AxiosConfig => {
    const config = {
        method: method,
        maxBodyLength: Infinity,
        url: `https://api.easypost.com/v2/${url}`,
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: apiKey,
            password: ""
        },
        data: ""
    };
    if (body) {
        config.data = JSON.stringify(body);
    }
    return config;
}


export async function confirmWebook(apiKey: string): Promise<{ webhooks: Webhook[] }> {
    const config = getConfig(apiKey, "get", "webhooks");
    const response = await axios.request(config);
    //  console.log(response.data);

    return response.data

}

export async function createEasypostWebhook(apiKey: string, accountId: string): Promise<Webhook> {

    const testForWebhook =  await confirmWebook(apiKey);

    const response = testForWebhook.webhooks.find((webhook: Webhook) => webhook.url.includes('parcelcraft'));

    if(response) {
      return response
    }

    const encrypedAccountId = parcelcraftEncrypt(accountId)

    const body =     {
        webhook: {
            url: `https://api.parcelcraft.com/api/webhooks/easypost/${encrypedAccountId}`
        }
    }

    const config = getConfig(apiKey, "post", "webhooks", body);
    const newResponse = await axios.request(config);
    return newResponse.data;

    

}

