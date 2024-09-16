
import express, { Router, Request, Response } from "express";
import supabase from "../services/supabase";
import { IShipment } from "@easypost/api";
import { verifyCaller } from "../auth/auth";


const router: Router = express.Router();

type ParcelcraftShipment = {
    account_id?: string | null
    carrier?: string | null
    created_at?: string | null
    est_delivery_date?: string | null
    fts?: unknown | null
    id?: number
    is_return?: boolean | null
    is_test_mode?: boolean | null
    reference_id?: string | null
    refund_status?: string | null
    service?: string | null
    shipment_id: string
    status?: string | null
    to_company?: string | null
    to_email?: string | null
    to_name?: string | null
    tracking?: string | null
    user_id?: string | null
}


async function getCustomerShipment(req: Request, res: Response) {
    const shipmentId = req.params.shipmentId;

    try {
        if (supabase) {
            let { data: shipments, error } = await supabase
                .from('shipments')
                .select('*')
                .eq('shipment_id', shipmentId)
                .limit(1)
                .single()

            res.send({

                data: shipments,
                error: error
            });
        }
    } catch (error) {
        console.error(error);
        res.send({

            error: error,
            data: null,
        });
    }
}

async function getAllAccountShipments(req: Request, res: Response) {

    const page = req.query.page ? parseInt(req.query.page + "") : 1; // Get page number from query parameter
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize + "") : 10; // Set the number of items per page
    const mode = req.query.mode === 'test' ? true : false

    let accountId = req.headers["stripe-account-id"] as string;
    if (req.headers["stripe-mode"] === 'test') {
        accountId = accountId + 'test'
    }

    try {
        if (supabase) {
            let { data: shipments, error } = await supabase
                .from('shipments')
                .select('*')
                .eq('account_id', accountId)
                .eq('is_test_mode', mode)
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, (page * pageSize))
            if (error) {
                throw error.message;
            }

            let has_more = false;

            if (shipments && shipments.length > pageSize) {
                has_more = true
                shipments.pop()

            }
            res.send({
                has_more: has_more,
                data: shipments,
                error: error
            });
        }

    } catch (error) {
        console.error(error);
        res.send({

            error: error,
            data: null,
        });
    }
}



async function searchShipments(req: Request, res: Response) {


    let accountId = req.headers["stripe-account-id"];
    if (req.headers["stripe-mode"] === 'test') {
        accountId = accountId + 'test'
    }


    const page = req.query.page ? parseInt(req.query.page + "") : 1; // Get page number from query parameter
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize + "") : 10; // Set the number of items per page
    const searchTerm = req.query.searchTerm ? (req.query.searchTerm + "").toLowerCase() : null; // Get search term from query parameter
    const searchType = req.query.searchType ? req.query.searchType : 'exact'; // Get search term from query parameter
    const mode = req.query.mode === 'test' ? true : false


    if (!searchTerm) {
        return getAllAccountShipments(req, res)
    }

    // if(searchType === 'fuzzy') {
    //     return fuzzySearch(req, res)
    // }

    try {
        if (supabase && accountId) {
            let { data: shipments, error } = await supabase
                .from('shipments')
                .select('*')
                .eq('account_id', accountId)
                .eq('is_test_mode', mode)
                .textSearch('fts', searchTerm)
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, (page * pageSize))

            // Calculate range based on page number and pageSize

            if (error) {
                throw error.message;
            }

            let has_more = false;

            if (shipments && shipments.length > pageSize) {
                has_more = true
                shipments.pop()

            }

            res.send({
                has_more: has_more,
                data: shipments,
                searchTerm: req.query.searchTerm
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error,
            data: null
        });
    }
}

async function fuzzySearch(req: Request, res: Response) {



    let accountId = req.headers["stripe-account-id"];
    if (req.headers["stripe-account-id"] === 'test') {
        accountId = accountId + 'test'
    }

    const page = req.query.page ? parseInt(req.query.page + "") : 1; // Get page number from query parameter
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize + "") : 10; // Set the number of items per page
    const searchTerm = req.query.searchTerm ? (req.query.searchTerm + "").toLowerCase() : ''; // Get search term from query parameter
    const mode = req.query.mode === 'test' ? true : false

    try {
        if (supabase && accountId) {
            let { data: shipments, error } = await supabase
                .from('shipments')
                .select('*')
                .eq('account_id', accountId)
                .eq('is_test_mode', mode)
                .ilike('fts', `%${searchTerm}%`)
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, (page * pageSize))

            // Calculate range based on page number and pageSize

            if (error) {
                throw error.message;
            }

            let has_more = false;

            if (shipments && shipments.length > pageSize) {
                has_more = true
                shipments.pop()

            }

            res.send({
                has_more: has_more,
                data: shipments,
                searchTerm: req.query.searchTerm
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error,
            data: null
        });
    }
}


const buildParcelcraftShipment = (accountId: string, email: string, shipment: IShipment): ParcelcraftShipment => {
    const parcelcraftShipment: ParcelcraftShipment = {
        account_id: accountId,
        created_at: shipment.created_at,
        carrier: shipment.selected_rate.carrier,
        reference_id: shipment.reference,
        service: shipment.selected_rate.service,
        shipment_id: shipment.id,
        to_company: shipment.to_address.company || "",
        to_email: shipment.to_address.email || "",
        to_name: shipment.to_address.name,
        tracking: shipment.tracking_code,
        user_id: email,
        is_return: shipment.is_return,
        is_test_mode: shipment.mode === 'test' ? true : false,
        status: shipment.status,
        refund_status: shipment.refund_status
        
    }
    if(shipment.selected_rate?.delivery_date || shipment?.tracker?.est_delivery_date) {
        parcelcraftShipment.est_delivery_date = shipment.selected_rate.delivery_date  || shipment?.tracker?.est_delivery_date
    }


 
    return parcelcraftShipment;

}

export async function updateShipment(req: Request, res: Response) {

    const shipment = req.body.shipment ? req.body.shipment as IShipment : req.body as IShipment;

    let accountId = req.headers["stripe-account-id"] ? req.headers["stripe-account-id"] as string : "";
     if (req.headers["stripe-mode"] === 'test') {
        accountId = accountId + 'test'
    }

    const parcelcraftShipment = buildParcelcraftShipment(accountId, req.headers["stripe-email"] as string, shipment)
    if (supabase) {
        const { data, error } = await supabase
            .from('shipments')
            .upsert(parcelcraftShipment, { onConflict: 'shipment_id' })
            .select()
            .single()


        return { error: error, data }
    } else {
        return { error: true, data: null }
    }
}

export async function createShipment(req: Request, res: Response) {
    try {
        const shipment = req.body.shipment ? req.body.shipment as IShipment : req.body as IShipment;

        let accountId = req.headers["stripe-account-id"] ? req.headers["stripe-account-id"] as string : "";
        if (req.headers["stripe-mode"] === 'test') {
            accountId = accountId + 'test'
        }

        const parcelcraftShipment = buildParcelcraftShipment(accountId, req.headers["stripe-email"] as string, shipment)
        if (supabase) {

            res.send({
                error: parcelcraftShipment,
                data: accountId,
                email: req.headers["stripe-email"]
            })



        } else {
            res.send({
                error: true,
                data: false
            })
        }

    } catch (e) {
        res.send({
            error: JSON.stringify(e),
            data: false
        })
    }
}



export async function voidShipment(req: Request, res: Response) {


    const shipmentId = req.params.shipmentId;
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('shipments')
                .update({ refund_status: "submitted" })
                .eq('shipment_id', shipmentId)
                .select()
                .single()

            res.send({
                error: error,
                data: data,
                voided: true
            })
        } else {
            res.send({
                error: true,
                voided: false
            })
        }
    } catch (e) {
        res.send({
            error: JSON.stringify(e),
            voided: false
        })
    }
}

const patchUserShipment = async (req: Request, res: Response) => {

    try {


        const results = await updateShipment(req, res);

        res.send(results);

     } catch (error) {
     
         res.send({
             error: JSON.stringify(error),
             data: null,
         });
     }
}

router.post("", patchUserShipment)
router.patch("", createShipment)
router.get("/search", verifyCaller, searchShipments);
router.get("/fuzzy", verifyCaller, fuzzySearch);
router.get("/:account", verifyCaller, getAllAccountShipments);
router.delete("/:shipmentId", verifyCaller, voidShipment);
router.get("/:account/:shipmentId", verifyCaller, getCustomerShipment);


export default router;