import {GenericService} from "../util/svc";
import {Sequelize} from 'sequelize';
import config from "../util/config";
import blockchain from "../models/blockchain";
import subscription, {
    Subscription as SubscriptionType,
} from "../models/subscription";
import settlement, {Settlement} from "../models/settlement";
import owner, {Owner} from "../models/owner";
import plan from "../models/plan";

export default class DBService extends GenericService {
    sequelize: Sequelize;
    blockchain?: ReturnType<typeof blockchain>;
    subscription?: ReturnType<typeof subscription>;
    settlement?: ReturnType<typeof settlement>;
    owner?: ReturnType<typeof owner>;
    plan?: ReturnType<typeof plan>;

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

    async addSubscription(data: SubscriptionType) {
        return this.subscription?.addSubscription(data);
    }

    async cancelSubscription(id: string) {
        return this.subscription?.cancelSubscription(id);
    }

    async addOrUpdateSettlement(data: Settlement) {
        return this.settlement?.addOrUpdateSettlement(data);
    }

    async start() {
        this.blockchain = await blockchain(this.sequelize);
        this.subscription = await subscription(this.sequelize);
        this.settlement = await settlement(this.sequelize);
        this.owner = await owner(this.sequelize);
        this.plan = await plan(this.sequelize);

        this.subscription?.model.hasMany(this.settlement?.model);
        this.settlement?.model.belongsTo(this.subscription?.model);

        this.owner?.model.hasMany(this.plan?.model);
        this.plan?.model.belongsTo(this.owner?.model);

        this.blockchain?.model.sync();
        this.subscription?.model.sync();
        this.settlement?.model.sync();
        this.owner?.model.sync();
        this.plan?.model.sync();
    }
}