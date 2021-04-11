import {GenericService} from "../util/svc";
import express, {Express, Request, Response} from "express";
import cors, {CorsOptions} from "cors";
const port = process.env.PORT || 11664;

const whitelist: {[origin: string]: boolean} = {
    'http://localhost:8080': true,
    '': true,
};

const corsOptions: CorsOptions = {
    origin: function (origin= '', callback) {
        if (whitelist[origin]) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};

export default class HttpService extends GenericService {
    app: Express;

    constructor() {
        super();
        this.app = express();
        this.app.use('/', express.static('./build-ui'));
        this.app.use(cors(corsOptions));
    }

    wrapHandler(handler: (req: Request, res: Response) => Promise<void>) {
        return async (req: Request, res: Response) => {
            await handler(req, res);
        }
    }

    addRoutes() {
        this.app.get('/vendors/:address/plans', this.wrapHandler(async (req, res) => {
            res.send('ok');
        }));

        this.app.post('/vendors/:address/plans', this.wrapHandler(async (req, res) => {
            res.send('ok');
        }));

        this.app.get('/vendors/:address', this.wrapHandler(async (req, res) => {
            res.send('ok');
        }));

        this.app.post('/vendors', this.wrapHandler(async (req, res) => {
            res.send('ok');
        }));
    }

    async start() {
        this.app.listen(port, () => {
            console.log(`Web Server listening at ${port}...`);
        });
    }
}