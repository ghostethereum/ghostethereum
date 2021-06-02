import {GenericService} from "../util/svc";
import express, {Express, Request, Response} from "express";
import bodyParser from "body-parser";
import cors, {CorsOptions} from "cors";
import Web3 from "web3";
import http from 'http';
// import https from 'https';
import {recoverTypedSignature_v4} from "eth-sig-util";
import {createProfile} from "../../util/message-params";
import assert from "assert";
const GhostAdminAPI = require('@tryghost/admin-api');
import fs from "fs";
import JSZip from "jszip";
import path from "path";
import config from "../../util/config";
// const privateKey = fs.readFileSync("./key.pem", 'utf8');
// const certificate = fs.readFileSync("./cert.pem", 'utf8');

const httpsPort = process.env.HTTPS_PORT || 11665;
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

        this.app.post('/ghost/signup', jsonParser, this.wrapHandler(async (req, res) => {
            const { signature, account, email, uuid } = req.body;

            assert(email);
            assert(uuid);

            const msgParams: any = {
                domain: {
                    chainId: 4,
                    version: '1',
                },
                primaryType: 'Payload',
                types: {
                    EIP712Domain: [
                        { name: 'chainId', type: 'uint' },
                        { name: 'version', type: 'string' },
                    ],
                    Payload: [
                        { name: 'email', type: 'string' },
                    ],
                },
                message: { email },
            };
            const address = recoverTypedSignature_v4({
                sig: signature,
                data: msgParams,
            });

            const checksumAddress = Web3.utils.toChecksumAddress(address);

            assert(
                checksumAddress === Web3.utils.toChecksumAddress(account),
                'invalid signature'
            );

            const owner = await this.call('db', 'getOwnerById', uuid);
            const subscription = await this.call(
                'db',
                'getSubscriptionById',
                `0x${uuid.replace(/-/g, '')}${checksumAddress.toLowerCase().slice(2)}`,
            )

            assert(subscription, 'cannot find subscription');
            assert(owner, 'cannot find owner profile');

            const api = new GhostAdminAPI({
                url: owner.ghostAPI,
                key: owner.ghostAdminAPIKey,
                version: 'v3',
            });

            const existing = await api.members.browse({
                filter: `email:${email}`
            });

            assert(!existing.length, 'member email already exist');

            const ghostMember = await api.members.add({
                name: '',
                email: email,
                note: `address=${checksumAddress}`
            });

            await this.call('db', 'updateGhostId', subscription.id, ghostMember.id);

            res.send(makeResponse(ghostMember));
        }));

        this.app.get('/ghost/member/:uuid', jsonParser, this.wrapHandler(async (req, res) => {
            const { uuid } = req.params;
            const { email } = req.query;

            assert(email);
            assert(uuid);

            const owner = await this.call('db', 'getOwnerById', uuid);

            const api = new GhostAdminAPI({
                url: owner.ghostAPI,
                key: owner.ghostAdminAPIKey,
                version: 'v3',
            });

            const existing = await api.members.browse({
                filter: `email:${email}`
            });

            assert(!!existing.length, 'member email does not exist');

            const [member] = existing;
            const [,address] = member.note?.split('=');
            const checksumAddress = Web3.utils.toChecksumAddress(address);
            const subscriptionId = `0x${uuid.replace(/-/g, '')}${checksumAddress.toLowerCase().slice(2)}`;
            const subscription = await this.call(
                'db',
                'getSubscriptionById',
                subscriptionId,
            );
            const [lastSettlement] = await this.call(
                'db',
                'getLastSettle',
                subscriptionId,
            )

            assert(subscription, 'cannot find subscription');
            assert(owner, 'cannot find owner profile');

            res.send(makeResponse({
                member,
                subscription,
                lastSettlement,
            }));
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

        this.app.put('/profiles/:profileId', jsonParser, this.wrapHandler(async (req, res) => {
            const { signature, account, ...message } = req.body;
            const {profileId} = req.params;

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
                'db', 'updateOwnerProfile',
                {
                    id: profileId,
                    adminUrl: message.adminUrl,
                    adminAPIKey: message.adminAPIKey,
                    plans: message.plans,
                },
                checksumAddress,
            );

            res.send(makeResponse(result));
        }));

        this.app.get('/ghost-themes/:theme/:ownerId', this.wrapHandler(async (req, res) => {
            const {theme, ownerId} = req.params;

            const zip = new JSZip();
            const dir = path.join(process.cwd(), 'gthemes', theme);

            await copyDirectoryToZip(zip, dir);

            let membersSignupContent = await fs.readFileSync(path.join(dir, 'assets/react/signup.js'), 'utf-8');
            membersSignupContent = membersSignupContent.replace(/{{THEME_UUID}}/g, ownerId);
            membersSignupContent = membersSignupContent.replace(/{{THEME_WEB3_PAY_URL}}/g, config.apiUrl);
            membersSignupContent = membersSignupContent.replace(/{{THEME_CONTRACT_ADDRESS}}/g, config.subscriptionContractAddress);

            let membersAccountContent = await fs.readFileSync(path.join(dir, 'assets/react/account.js'), 'utf-8');
            membersAccountContent = membersAccountContent.replace(/{{THEME_UUID}}/g, ownerId);
            membersAccountContent = membersAccountContent.replace(/{{THEME_WEB3_PAY_URL}}/g, config.apiUrl);
            membersAccountContent = membersAccountContent.replace(/{{THEME_CONTRACT_ADDRESS}}/g, config.subscriptionContractAddress);

            zip.file('assets/react/signup.js', membersSignupContent);
            zip.file('assets/react/account.js', membersAccountContent);

            const content = await zip.generateAsync({ type: 'nodebuffer' })
            res.setHeader('Content-Disposition', 'attachment; filename="theme.zip"');
            res.setHeader('Content-Type', 'application/zip');
            res.send(content);
        }));

        this.app.get('/ghost-routes/:theme/:ownerId', this.wrapHandler(async (req, res) => {
            const {theme, ownerId} = req.params;

            const filepath = path.join(process.cwd(), 'groutes', theme, 'routes.yaml');

            const content = await fs.readFileSync(filepath, 'utf-8');

            res.setHeader('Content-Disposition', 'attachment; filename="routes.yaml"');
            res.setHeader('Content-Type', 'text/plain');
            res.send(content);
        }));
    }

    async start() {
        const httpServer = http.createServer(this.app);
        // const httpsServer = https.createServer({
        //     key: privateKey,
        //     cert: certificate,
        // }, this.app);
        //
        // httpsServer.listen(httpsPort);
        httpServer.listen(port);
        // this.app.listen(port, () => {
        //     console.log(`Web Server listening at ${port}...`);
        // });
    }
}

async function copyDirectoryToZip(
    zip: JSZip,
    dirpath: string,
) {
    const files = fs.readdirSync(dirpath);
    for (let file of files) {
        const filepath = path.join(dirpath, file);
        if (fs.lstatSync(filepath).isDirectory()) {
            if (filepath.includes('node_modules')) {
                continue;
            }
            const dir = zip.folder(file);
            await copyDirectoryToZip(dir as JSZip, filepath);
        } else {
            const content = fs.readFileSync(filepath);
            zip.file(file, content)
        }
    }
}