const DefaultSettings = {
    alwaysCreateReturns: false,
    BillToParty: "recipient",
    carrier_id: "",
    chargeEvent: "carrier_default",
    CollectOnDeliveryPaymentType: "any",
    confirmation: "none",
    country: "US",
    currency: "USD",
    Currency: "usd",
    defaultWarehouse: '',
    dimension_unit: "inch",
    displayScheme: "label",
    format: "pdf",
    height: "0",
    InsuranceProvider: "none",
    isInvoiceOnLabelReference: true,
    isLive: false,
    itemCountOnLabelReference: true,
    labelLayout: "4x6",
    length:"0",
    logoId: null,
    metaDataPrefix: "",
    NonDelivery: "return_to_sender",
    OriginType: "drop_off",
    package_code: "",
    PackageContents: "merchandise",
    packaging_weight_unit: "ounce",
    packaging_weight: "1",
    productShippable: false,
    productWeight: '',
    productWeightUnit: "",
    service_code: "",
    showOpenInvoices: false,
    sendEmailType: "parcelcraft",
    tariffCode: "",
    useMetaData: true,
    validateAddress: "validate_and_clean",
    warehouse: null,
    countryOfOrigin: "",
    warnBillingAddressUsed: true,
    weight: '',
    weight_unit: 'ounce',
    width: "0",
    ref:"",
    test:"",
    sg:"",
    templateShipped:"",
    templateVoided:"",
    templateReturn:"",
    unsubscribeGroup:"",
    bccEmails:"",
    useWebhook: false,
    webhookURL:"",
    webhookSecret:""
}


export interface UserSettingsResponse {
    fromCache: boolean;
    data?: UserSettings;
}
export type UserSettings = {
    showOpenInvoices?:boolean;
    printToBrowser?: boolean;
    printToEmail?: boolean;
    printToEmailAddress?: string;
    printToPrintNode?: boolean
    defaultWarehouse?: string;
    warnBillingAddressUsed?: boolean
    node?: string;
    useScale?: boolean;
    computerId?: number;
    scaleNum?: number;
    labelSize?: '4x6' | 'letter';
    labelPrinterId?: number;
    labelPrinterPaper?: string;
    labelPrinterBin?: string;
    labelPrinterDpi?: string;
    labelPrinterMedia?: string;
    labelPrinterRotate?: number;
    labelPrinterFit?: boolean;
    formPrinterId?: number;
    formPrinterPaper?: string;
    formPrinterBin?: string;
    formPrinterDpi?: string;
    formPrinterMedia?: string;
    formPrinterRotate?: number;
    formPrinterFit?: boolean;
}


export type printerSettings = {
    id: number;
    paper: string;
    bin?: string;
}

export type AccountSettings = {
    sg?: string;
    ref?: string;
    test?: string;
    customs_description?: string;
    weight?: string;
    weight_unit: string;
    dimension_unit?:string;
    carrier_id?:string;
    package_code?:string
    packaging_weight_unit?:string
    packaging_weight?:string
    width:string;
    height:string;
    length:string;
    service?:string;
    sendEmailType?: string;
    verifiedSender?:string;
    templateShipped?:string;
    templateVoided?:string;
    templateReturn?: string,
    unsubscribeGroup?:string;
    bccEmails:string;
    replyToEmail?:string;
    useWebhook: boolean;
    webhookURL:string;
    webhookSecret:string;
}
export interface AccountSettingsResponse {
    fromCache: boolean;
    data?: AccountSettings;

}

export type UserAndAccountSettings = UserSettings & AccountSettings & typeof DefaultSettings;

export interface UserAndAccountSettingsResponse {
    error?: boolean;
    settings?: UserAndAccountSettings;

}

type deleteAccountSettingsResponse = {
    error: string;
    data: string;
}


type AllSettings = {
    error: boolean
    settings: UserAndAccountSettings;
    warehouses: []
    tax: []
}