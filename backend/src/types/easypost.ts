export type EasyPostEvent = {
    description: string;
    mode: string;
    previous_attributes: {
        status: string;
    };
    created_at: string;
    pending_urls: string[];
    completed_urls: string[];
    updated_at: string;
    id: string;
    user_id: string;
    status: string;
    object: string;
    result: {
        id: string;
        object: string;
        mode: string;
        tracking_code: string;
        status: string;
        status_detail: string;
        created_at: string;
        updated_at: string;
        signed_by: null;
        weight: null;
        est_delivery_date: string;
        shipment_id: string;
        carrier: string;
        tracking_details: {
            object: string;
            message: string;
            description: string;
            status: string;
            status_detail: string;
            datetime: string;
            source: string;
            carrier_code: string;
            tracking_location: {
                object: string;
                city: string | null;
                state: string | null;
                country: string;
                zip: string | null;
            }[];
        }[];
        carrier_detail: {
            object: string;
            service: null;
            container_type: null;
            est_delivery_date_local: null;
            est_delivery_time_local: null;
            origin_location: string;
            origin_tracking_location: {
                object: string;
                city: string;
                state: string;
                country: string;
                zip: string;
            };
            destination_location: null;
            destination_tracking_location: null;
            guaranteed_delivery_date: null;
            alternate_identifier: null;
            initial_delivery_attempt: null;
        };
        finalized: boolean;
        is_return: boolean;
        public_url: string;
    };
};

export const easypostEvent = {
    description: "tracker.updated",
    mode: "production",
    previous_attributes: { "status": "in_transit" },
    created_at: "2024-02-27T09:46:15.000Z",
    pending_urls: ["https://staging.rtkmobile.com/wp-content/plugins/rtk-mobile/public/endpoints/easypost-endpoint.php"],
    completed_urls: [],
    updated_at: "2024-02-27T09:46:15.000Z",
    id: "evt_0c91a40cd55511ee9cb655bf73b03d04",
    user_id: "user_cde4694bdf4143d599940cc3789720d6",
    status: "pending",
    object: "Event",
    result: {
        id: "trk_723e0ca338fb4b849ba0880bdef5d441",
        object: "Tracker",
        mode: "production",
        tracking_code: "9400136110322414007637",
        status: "in_transit",
        status_detail: "unknown",
        created_at: "2024-02-21T21:14:27Z",
        updated_at: "2024-02-27T09:45:15Z",
        signed_by: null,
        weight: null,
        est_delivery_date: "2024-02-26T00:00:00Z",
        shipment_id: "shp_142fe0fea2884f11ad1be14f3d03fd47",
        carrier: "USPS",
        tracking_details: [{
            object: "TrackingDetail",
            message: "USPS IN POSSESSION OF ITEM",
            description: "",
            status: "in_transit",
            status_detail: "status_update",
            datetime: "2024-02-21T14:29:00Z",
            source: "USPS",
            carrier_code: "03",
            tracking_location: {
                object: "TrackingLocation",
                city: "SANTA CLARA",
                state: "UT",
                country: "US",
                zip: "84765"
            }
        },
        {
            object: "TrackingDetail",
            message: "DEPART POST OFFICE",
            description: "",
            status: "in_transit",
            status_detail: "departed_facility",
            datetime: "2024-02-21T15:32:00Z",
            source: "USPS",
            carrier_code: "SF",
            tracking_location: {
                object: "TrackingLocation",
                city: "SANTA CLARA",
                state: "UT",
                country: "US",
                zip: "84765"
            }
        },
        ],
        carrier_detail: {
            object: "CarrierDetail",
            service: null,
            container_type: null,
            est_delivery_date_local: null,
            est_delivery_time_local: null,
            origin_location: "SANTA CLARA UT, US, 84765",
            origin_tracking_location: {
                object: "TrackingLocation",
                city: "SANTA CLARA",
                state: "UT",
                country: "US",
                zip: "84765"
            },
            destination_location: null,
            destination_tracking_location: null,
            guaranteed_delivery_date: null,
            alternate_identifier: null,
            initial_delivery_attempt: null
        },
        finalized: false,
        is_return: false,
        public_url: "https://track.easypost.com/djE6dHJrXzcyM2UwY2EzMzhmYjRiODQ5YmEwODgwYmRlZjVkNDQx"
    }
}