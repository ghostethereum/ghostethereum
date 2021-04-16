import {Sequelize, Model, BIGINT, STRING, BOOLEAN} from "sequelize";

export type Subscription = {
    id: string;
    txHash: string;
    blockHeight: number;
    ownerAddress: string;
    subscriberAddress: string;
    tokenAddress: string;
    value: number;
    interval: number;
    cancelled: boolean;
    ghostId: string;
};

const subscription = (sequelize: Sequelize) => {
    const model = sequelize.define('subscription', {
        id: {
            type: STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
            primaryKey: true,
        },
        txHash: {
            type: STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        ghostId: {
            type: STRING,
        },
        blockHeight: {
            type: BIGINT,
            allowNull: false,
            validate: {
                notEmpty: true,
                min: 1,
            },
        },
        ownerAddress: {
            type: STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        subscriberAddress: {
            type: STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        tokenAddress: {
            type: STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        value: {
            type: BIGINT,
            allowNull: false,
            validate: {
                notEmpty: true,
                min: 1,
            },
        },
        interval: {
            type: BIGINT,
            allowNull: false,
            validate: {
                notEmpty: true,
                min: 1,
            },
        },
        cancelled: {
            type: BOOLEAN,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
            defaultValue: false,
        }
    }, {
        indexes: [
            { fields: ['ownerAddress'] },
            { fields: ['subscriberAddress'] },
            { fields: ['cancelled'] },
            { fields: ['interval'] },
        ],
    });

    const addSubscription = async (data: Subscription) => {
        const result = await model.findOne({
            where: { id: data.id },
        });

        if (!result) {
            return await model.create({
                id: data.id,
                txHash: data.txHash,
                blockHeight: data.blockHeight,
                ownerAddress: data.ownerAddress,
                subscriberAddress: data.subscriberAddress,
                tokenAddress: data.tokenAddress,
                value: data.value,
                interval: data.interval,
                cancelled: false,
            });
        }

        return await result.update({
            txHash: data.txHash,
            blockHeight: data.blockHeight,
            value: data.value,
            interval: data.interval,
            cancelled: false,
        });
    }

    const updateGhostId = async (id: string, ghostId: string) => {
        const result = await model.findOne({
            where: { id },
        });

        if (!result) {
            return Promise.reject(`cannot find subscription id - ${id}`);
        }

        return result.update({
            ghostId,
        });
    }

    const cancelSubscription = async (id: string) => {
        const result = await model.findOne({
            where: { id },
        });

        if (!result) {
            return Promise.reject(`cannot find subscription id - ${id}`);
        }

        return result.update({
            cancelled: true,
        });
    }

    const getSubscriptionBySubscriberAddress = async (subscriberAddress: string) => {
        const result = await model.findAll({
            where: { subscriberAddress },
        });

        return result;
    }

    const getSubscriptionById = async (
        id: string,
    ) => {
        const result = await model.findOne({
            where: { id },
        });

        return result;
    }

    return {
        model,
        addSubscription,
        cancelSubscription,
        getSubscriptionBySubscriberAddress,
        getSubscriptionById,
        updateGhostId,
    };
}

export default subscription;
