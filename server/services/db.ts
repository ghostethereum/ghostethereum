import {GenericService} from "../util/svc";
import {Sequelize} from 'sequelize';
import config from "../util/config";
import blockchain from "../models/blockchain";
import subscription from "../models/subscription";
import settlement from "../models/settlement";

export default class DBService extends GenericService {
    sequelize: Sequelize;
    blockchain?: ReturnType<typeof blockchain>;
    subscription?: ReturnType<typeof subscription>;
    settlement?: ReturnType<typeof settlement>;

    constructor() {
        super();

        if (config.dbDialect === 'sqlite') {
            this.sequelize = new Sequelize({
                dialect: 'sqlite',
                storage: config.dbStorage,
            });
        } else {
            this.sequelize = new Sequelize(
                config.dbName,
                config.dbUsername,
                config.dbPassword,
                {
                    host: config.dbHost,
                    dialect: config.dbDialect,
                }
            );
        }
    }

    async start() {
        this.blockchain = await blockchain(this.sequelize);
        this.subscription = await subscription(this.sequelize);
        this.settlement = await settlement(this.sequelize);

        this.subscription?.model.hasMany(this.settlement?.model);
        this.settlement?.model.belongsTo(this.subscription?.model);

        this.blockchain?.model.sync();
        this.subscription?.model.sync();
        this.settlement?.model.sync();
    }
}