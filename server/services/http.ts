import {GenericService} from "../util/svc";
import express, {Express} from "express";
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

    async start() {
        this.app.listen(port, () => {
            // eslint-disable-next-line no-console
            console.log(`Web Server listening at ${port}...`);
        });
    }
}