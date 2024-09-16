
import express, { Router, Request, Response, NextFunction } from "express";
import supabase from "../services/supabase";
import redisClient, { getRedisKeys } from "../services/redis";
import { IAddress } from "@easypost/api";
import { Json } from "../types/Database";
import { verifyCaller } from "../auth/auth";


const router: Router = express.Router();

type Warehouse = {
    id: string;
    account_id: string;
    address: IAddress;
    return_address: IAddress;
}
type SupabaseError = {
    message: string;
    details: any; // This can be any type depending on how Supabase structures their error details
};


type EasyPostAddress = IAddress & Json;


export async function createNewWarehouse(req: Request, res: Response,) {

    const account = req.params.account;
    const { address, return_address } = req.body;
    console.log(address)
    try {
        if (supabase) {

            let { data: warehouses, error } = await supabase
                .from('warehouses')
                .insert({ account_id: account, address: address, return_address: return_address })
                .select()
                .single()

            res.send({
                data: warehouses,
                error: error
            });
            const accounts = getRedisKeys(req)
            await redisClient.del(accounts.warehouse);
            await redisClient.del(accounts.account);

        }

    } catch (error) {
        console.error(error);
        res.status(404).send({

            data: null,
            error: error,
        });
    }

}



async function deleteWarehouse(req: Request, res: Response) {
    const id = req.params.id;
    const account = req.params.account;

    try {
        if (supabase) {
            const { error } = await supabase
                .from('warehouses')
                .delete()
                .eq('id', id)
                .eq('account_id', account)



            res.send({
                deleted: true,
                error: error,
            });
            const accounts = getRedisKeys(req)
            await redisClient.del(accounts.warehouse);
            await redisClient.del(accounts.account);

        }
    } catch (error) {
        console.error(error);
        res.send({
            error: error,
            data: null,
        });
    }
}


async function getAllAccountWarehouses(req: Request, res: Response) {
    const account = req.params.account;
    try {
        const accounts = getRedisKeys(req)
        const cacheResults = await redisClient.get(accounts.warehouse);
        if (cacheResults) {
            const results = JSON.parse(cacheResults);
            res.send({
                fromCache: true,
                data: results,
                error: false
            });
        } else {
            if (supabase) {
                let { data: warehouses, error } = await supabase
                    .from('warehouses')
                    .select('*')
                    .eq('account_id', account)
                if (warehouses && warehouses.length === 0) {
                    throw "API returned an empty array";
                }
                res.send({
                    fromCache: false,
                    data: warehouses,
                    error: error
                });
               await redisClient.set(accounts.warehouse, JSON.stringify(warehouses));
            }
        }

    } catch (error) {
        console.error(error);
        res.send({

            error: error,
            data: [],
        });
    }
}

export async function updateWarehouse(id: string, address: EasyPostAddress | null, returnAddress: EasyPostAddress | null) {

    if (supabase) {
        const { data, error } = await supabase
            .from('warehouses')
            .update({ id: id, address: address })
            .eq('id', id)
            .select()
            .single()




        return { error: error, data }
    } else {
        return { error: true, data: null }
    }

}

const patchUserWarehouse = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const account = req.params.account;
        const { address, return_address } = req.body;


        const results = await updateWarehouse(id, address, return_address);

        res.send(results);
        const accounts = getRedisKeys(req)
        await redisClient.del(accounts.warehouse);
        await redisClient.del(accounts.user);

    } catch (error) {
        console.error(error);
        res.status(404).send({
            error: error,
            data: null,
        });
    }
}

router.delete("/:account/:id", deleteWarehouse);

router.get("/:account",  verifyCaller, getAllAccountWarehouses);
router.patch("/:account/:id", verifyCaller,  patchUserWarehouse)
router.post("/:account", verifyCaller, createNewWarehouse)


export default router;