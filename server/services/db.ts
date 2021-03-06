import {GenericService} from "../util/svc";
import {Sequelize} from 'sequelize';
import config from "../../util/config";
import blockchain from "../models/blockchain";
import subscription, {
    Subscription as SubscriptionType,
} from "../models/subscription";
import settlement, {Settlement} from "../models/settlement";
import owner from "../models/owner";
import plan, {CreatePlanPayload} from "../models/plan";
import {PaymentProfilePayload} from "../../ui/src/ducks/profiles";

const TitleToInterval: {
    [title: string]: number;
} = {
    Monthly: 60 * 60 * 24 * (365/12),
    Yearly: 60 * 60 * 24 * 365,
    Weekly: 60 * 60 * 24 * 7,
    'By Minute (dev test)': 60,
};

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
                },
            );
        }
    }

    async addSubscription(data: SubscriptionType) {
        return this.subscription?.addSubscription(data);
    }

    async updateGhostId(id: string, ghostId: string) {
        return this.subscription?.updateGhostId(id, ghostId);
    }

    async cancelSubscription(id: string) {
        return this.subscription?.cancelSubscription(id);
    }

    async getLastSettle(data: string) {
        return this.settlement?.getLastSettle(data);
    }

    async addOrUpdateSettlement(data: Settlement) {
        return this.settlement?.addOrUpdateSettlement(data);
    }

    async getPaymentProfilesByOwner(address: string) {
        if (!this.owner || !this.plan) {
            throw new Error('db is not initialilzed');
        }

        const result = await this.owner?.model.findAll({
            where: {
                address: address,
            },
            include: [this.plan?.model],
        });

        return result.map(r => r.toJSON());
    }

    async getSubscriptionBySubscriberAddress(address: string) {
        const result = await this.subscription?.getSubscriptionBySubscriberAddress(address);

        if (!result) return [];

        return result.map(r => r.toJSON());
    }

    async getSubscriptionById(id: string) {
        const result = await this.subscription?.getSubscriptionById(
            id,
        );
        return result?.toJSON();
    }

    async getOwnerById(id: string) {
        const result = await this.owner?.getOwnerById(id);

        if (!result) return [];

        return result;
    }


    async getPlansByOwner(ownerId: string) {
        if (!this.plan) {
            throw new Error('db ist not initialized');
        }

        const owner = await this.owner?.getOwnerById(ownerId);
        const result = await this.plan?.getPlansByOwner(ownerId);
        const returnData = [];


        for (let r of result) {
            const json = r.toJSON();
            const tokenData = await this.call(
                'indexer',
                'getTokenData',
                (json as any).tokenAddress,
            );

            returnData.push({
                ...json,
                ownerAddress: owner?.address,
                tokenSymbol: tokenData.symbol,
                tokenDecimals: +tokenData.decimals,
            });
        }

        return returnData;
    }

    async updateOwnerProfile(data: PaymentProfilePayload, address: string) {
        const owner = await this.owner?.updateOwner({
            id: data.id as string,
            ghostAdminAPIKey: data.adminAPIKey,
            ghostAPI: data.adminUrl,
            ghostContentAPIKey: '',
            address: address,
        });

        await this.plan?.deletePlansByOwner((owner as any).id);

        const plans = [];

        for (let i = 0; i < data.plans.length; i++) {
            const plan = data.plans[i];
            const tokenData = await this.call('indexer', 'getTokenData', plan.currency);
            const planPayload: CreatePlanPayload = {
                title: plan.title,
                description: plan.description,
                value: plan.amount,
                tokenAddress: tokenData.address,
                ownerId: (owner as any).id,
                interval: TitleToInterval[plan.title],
            };

            const result = await this.plan?.createPlan(planPayload);
            plans.push(result!.toJSON());
        }

        return {
            ...owner!.toJSON(),
            plans,
        };
    }

    async createOwnerProfile(data: PaymentProfilePayload, address: string) {
        const owner = await this.owner?.createOwner({
            ghostAdminAPIKey: data.adminAPIKey,
            ghostAPI: data.adminUrl,
            ghostContentAPIKey: '',
            address: address,
        });

        const plans = [];

        for (let i = 0; i < data.plans.length; i++) {
            const plan = data.plans[i];
            const tokenData = await this.call('indexer', 'getTokenData', plan.currency);
            const planPayload: CreatePlanPayload = {
                title: plan.title,
                description: plan.description,
                value: plan.amount,
                tokenAddress: tokenData.address,
                ownerId: (owner as any).id,
                interval: TitleToInterval[plan.title],
            };

            const result = await this.plan?.createPlan(planPayload);
            plans.push(result!.toJSON());
        }

        return {
            ...owner!.toJSON(),
            plans,
        };
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

        this.blockchain?.model.sync({ force: false });
        this.subscription?.model.sync({ force: false });
        this.settlement?.model.sync({ force: false });
        this.owner?.model.sync({ force: false });
        this.plan?.model.sync({ force: false });
    }
}