import {GenericService} from "../util/svc";
import express, {Express, Request, Response} from "express";
import bodyParser from "body-parser";
import cors, {CorsOptions} from "cors";
import Web3 from "web3";
import {recoverTypedSignature_v4} from "eth-sig-util";
import {createProfile} from "../../util/message-params";
import assert from "assert";

const port = process.env.PORT || 11664;

const jsonParser = bodyParser.json();

const whitelist: {[origin: string]: boolean} = {
    'http://localhost:8080': true,
    '': true,
};

const corsOptions: CorsOptions = {
    origin: function (origin= '', callback) {
        // if (whitelist[origin]) {
            callback(null, true)
        // } else {
        //     callback(new Error('Not allowed by CORS'))
        // }
    }
};

function makeResponse(payload: any, error?: boolean) {
    return {
        payload,
        error,
    };
};

export default class HttpService extends GenericService {
    app: Express;

    constructor() {
        super();
        this.app = express();
        this.app.use('/', express.static('./build-ui'));
        this.app.use(cors(corsOptions));
        this.addRoutes();
    }

    wrapHandler(handler: (req: Request, res: Response) => Promise<void>) {
        return async (req: Request, res: Response) => {
            try {
                await handler(req, res);
            } catch(e) {
                res.status(500).send({
                    payload: e.message,
                    error: true,
                });

            }
        }
    }

    addRoutes() {
        this.app.get('/subscriptions', this.wrapHandler(async (req, res) => {
            const { subscriber } = req.query;
            const result = await this.call('db', 'getSubscriptionBySubscriberAddress', subscriber);
            res.send(makeResponse(result));
        }));

        this.app.get('/plans/:ownerId', this.wrapHandler(async (req, res) => {
            const result = await this.call('db', 'getPlansByOwner', req.params.ownerId);
            res.send(makeResponse(result));
        }));

        this.app.post('/vendors/:address/plans', jsonParser, this.wrapHandler(async (req, res) => {
            res.send('ok');
        }));

        this.app.get('/vendors/:address', this.wrapHandler(async (req, res) => {
            const result = await this.call('db', 'getPaymentProfilesByOwner', req.params.address);
            res.send(makeResponse(result));
        }));

        this.app.post('/vendors', jsonParser, this.wrapHandler(async (req, res) => {
            const { signature, account, ...message } = req.body;

            assert(!!message.adminUrl && typeof message.adminUrl === 'string');
            assert(!!message.adminAPIKey && typeof message.adminAPIKey === 'string');
            assert(message.plans.length);

            const msgParams: any = {
                ...createProfile,
                message: message,
            };
            const address = recoverTypedSignature_v4({
                sig: signature,
                data: msgParams,
            });

            const checksumAddress = Web3.utils.toChecksumAddress(address);

            assert(checksumAddress === Web3.utils.toChecksumAddress(account));

            const result = await this.call(
                'db', 'createOwnerProfile',
                {
                    adminUrl: message.adminUrl,
                    adminAPIKey: message.adminAPIKey,
                    plans: message.plans,
                },
                checksumAddress,
            );

            res.send(makeResponse(result));
        }));
    }

    async start() {
        this.app.listen(port, () => {
            console.log(`Web Server listening at ${port}...`);
        });
    }
}