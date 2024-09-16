const sgMail = require('@sendgrid/mail');
const client = require('@sendgrid/client');
import { MailData } from "@sendgrid/helpers/classes/mail"
import express, { Router, Request, Response } from "express";
import axios from "axios";
import { UserAndAccountSettings } from "../types/parcelcraft";
import { IShipment } from "@easypost/api";
import { updateShipment } from "./shipments";
const router: Router = express.Router();

sgMail.setApiKey(process.env.SENDGRID);

type EmailAddress = {
    email: string;
    name?: string;
};

type EmailObject = {
    to: EmailAddress[];
    bcc?: EmailAddress[];
};

function formatEmail(sender: string): { name?: string; email: string } {
    const matcher = sender.match(/(.*)<(.*)>/);
    if (matcher) {
        return {
            name: matcher[1].trim(),
            email: matcher[2].trim(),
        };
    } else {
        return {
            email: sender.trim()
        }

    }
}


function createEmailToAddresses(to: string, bcc: string | undefined) {

    const toEmailObject = formatEmail(to)
    // Create to object
    let toObject = [toEmailObject];


    // Create final email object
    let emailObject: EmailObject = {
        "to": toObject,
    };
    if (bcc) {
        // Split bcc emails by comma and remove any whitespace
        let bccEmails = bcc.split(',').map((email) => {
            return formatEmail(email)
        });

        // Filter out bcc emails that match the to email
        bccEmails = bccEmails.filter(email => email.email.toLowerCase() !== emailObject.to[0].email.toLowerCase());

        // Create bcc array of objects
        let bccObject = bccEmails

        // If bccObject is not empty, add it to the email object
        if (bccObject.length > 0) {
            emailObject["bcc"] = bccObject;
        }
    }

    return emailObject;
}



export async function downloadPDF(pdfUrl: string) {
    try {
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const data = response.data;
        console.log(data.headers)
        return Buffer.from(data).toString('base64');
    } catch (error) {
        console.error('Error downloading PDF:', error);
        // throw error;
    }
}


const sendPDFMail = async (email: string, pdf: string) => {
    sgMail.setApiKey(process.env.SENDGRID);

    const encodedPDF = await downloadPDF(pdf)
    const msg = {
        to: email,
        from: 'info@parcelcraft.com',
        subject: 'Shipping Label',
        templateId: 'd-577d27e894734e95b121b70397fed8e3',

        attachments: [
            {
                content: encodedPDF,
                filename: 'label.pdf',
                type: 'application/pdf',
                disposition: 'attachment',
            },
        ],
    };

    try {
        const emailResponse = await sgMail.send(msg);
        return emailResponse

    } catch (error) {
        return { error: "Email not sent" }
    }
}



const getTemplates = async (req: Request, res: Response) => {

    const { key } = req.body;
    client.setApiKey(key);

    const queryParams = {
        "generations": "dynamic",
        "page_size": 18
    };

    const request = {
        url: `/v3/templates`,
        method: 'GET',
        qs: queryParams
    }

    try {
        client.request(request)
            .then(([response]: [response: { body: any }]) => {

                res.send({

                    error: false,
                    data: response.body
                });
            })
            .catch((error: any) => {
                console.error(error);
                res.send({

                    error: true,
                    data: error
                });
            });

    } catch (error) {
        console.error(error)
        res.send({ error: error, key: key })
    }
}

const getVerifiedSenders = async (req: Request, res: Response) => {

    const { key } = req.body;
    client.setApiKey(key);



    const request = {
        url: `/v3/verified_senders`,
        method: 'GET'
    }

    try {
        client.request(request)
            .then(([response]: [response: { body: any }]) => {

                res.send({

                    error: false,
                    data: response.body
                });
            })
            .catch((error: any) => {
                console.error(error);
                res.send({

                    error: true,
                    data: error
                });
            });

    } catch (error) {
        console.error(error)
        res.send({ error: error, key: key })
    }
}



const getGroups = async (req: Request, res: Response) => {

    const { key } = req.body;
    client.setApiKey(key);

    const request = {
        url: `/v3/asm/groups`,
        method: 'GET',
    }

    try {
        client.request(request)
            .then(([response]: [response: { body: any }]) => {


                res.send({

                    error: false,
                    data: response.body
                });
            })
            .catch((error: any) => {
                console.error(error);
                res.send({

                    error: true,
                    data: error
                });
            });

    } catch (error) {
        console.error(error)
        res.send({ error: error, key: key })
    }
}

type Modify<T, R> = Omit<T, keyof R> & R;


export type CustomIShipment = Modify<IShipment, {
    tracking_URL?: string;
    service_name?: string;
}>


type SendEmailBodyParams = {
    settings: UserAndAccountSettings,
    shipment: CustomIShipment
    email: string;
}

type EmailOptions = {
    toEmail: string;
    bccEmails: string;
    template: string;
    group: string
}

const addSpacesToString = (input: string): string => {
    let output = input[0];

    for (let i = 1; i < input.length; i++) {
        if (
            input[i] === input[i].toUpperCase() &&
            input[i - 1] !== input[i - 1].toUpperCase() &&
            input[i - 1] !== ' '
        ) {
            output += ' ';
        }
        output += input[i];
    }
    output = output.replace(/(UPS)(.*)/g, '$1 $2').replace(/_/g, ' ');
    return output;
}


function getTrackingURL(carrier: string, tracking: string, originalTrackingLink: string) {

    carrier = carrier.replace(/DAP|Account|Default|\s/g, '').toLowerCase();
    let link = '';
    if (carrier === 'fedex' || carrier === 'ups' || carrier === 'usps') {
        if (carrier === "usps") {
            link = "https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=";
        } else if (carrier === "fedex") {
            link = "https://www.fedex.com/fedextrack/?trknbr=";
        } else if (carrier === "ups") {
            link =
                "http://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&tracknum=";
        }
        link = link + tracking;
    } else {
        link = originalTrackingLink
    }

    return link
}

const sendTemplateMail = async (req: Request) => {

    const notSentResponse = { error: "Email not sent" };
    const { settings, shipment, email }: SendEmailBodyParams = req.body;



    if (shipment.selected_rate.carrier) {

        shipment.tracking_URL = getTrackingURL(shipment.selected_rate.carrier, shipment.tracking_code, shipment.tracker.public_url)
        const carrier = shipment.selected_rate.carrier.replace(/DAP|Account|Default|\s/g, '').toUpperCase();
        const humanReadableService = addSpacesToString(shipment.selected_rate.service)

        shipment.service_name = `${carrier} ${humanReadableService}`

    }

    if (shipment.tracking_code && email) {

        var options: EmailOptions = {


        } as EmailOptions

        let verifiedSender = { name: 'Parcelcraft', email: 'info@parcelcraft.com' } as {name?:string, email: string}

        if (settings.sendEmailType === "sendgrid" && settings.sg) {
            sgMail.setApiKey(settings.sg);
            if (settings.verifiedSender && settings.verifiedSender) {
                verifiedSender = formatEmail(settings.verifiedSender)
            }

            if (shipment.is_return) {
                if (!settings.templateReturn) {
                    return { error: "No template for return email found" }
                }
                options.template = settings.templateReturn
            } else {
                if (!settings.templateShipped) {
                    return { error: "No template for 'shipped email' found" }
                }
                options.template = settings.templateShipped
            }
            if (shipment.refund_status === 'submitted' || shipment.refund_status === 'refunded') {
                if (!settings.templateVoided) {
                    return { error: "No template for 'shipment voided' found" }
                }
                options.template = settings.templateVoided
            }
            options.group = settings.unsubscribeGroup

        }
        if (settings.sendEmailType === "parcelcraft") {
            sgMail.setApiKey(process.env.SENDGRID);
            options.template = shipment.is_return ? "d-aae844ecb1dd4347b64e837bb57151ac" : "d-ef840f4012a148be989272f169a13116"
            options.group = "23606"
        }

        if (shipment.refund_status === 'submitted' || shipment.refund_status === 'refunded') {

            options.template = "d-e7ec8c273f4345b4b9fbae70c72b962f"
        }

        const msg: MailData = {
            from: verifiedSender,
            subject: 'Shipping Label',
            templateId: options.template,
            dynamicTemplateData: shipment,

        };

        if (options.group) {
            msg.asm = {
                groupId: parseInt(options.group + "")
            }
        }

        const emails = createEmailToAddresses(email, settings.bccEmails)

        const message: MailData = { ...msg, ...emails }

        try {
            const emailResponse = await sgMail.send(message);
            return emailResponse

        } catch (error) {
            return { error: error, message: message }
        }
    }
    else {
        return { error: "tracking_code or email not found" }
    }

}

router.post("/groups", getGroups)
router.post("/templates", getTemplates)
router.post("/verified_senders", getVerifiedSenders)


router.post("/send", async (req, res) => {

    const data = await sendTemplateMail(req);

    await updateShipment(req, res)

    res.send({

        data
    });

})



router.post("/", async (req, res) => {
    const { email, pdf } = req.body;

    const data = await sendPDFMail(email, pdf);

    res.send({

        data
    });

})

export default router;