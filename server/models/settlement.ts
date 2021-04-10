import {Sequelize, Model, BIGINT, STRING, DATE, BOOLEAN} from "sequelize";

export type Settlement = {
    subscriptionId: string;
    txHash: string;
    blockHeight: number;
    ownerAddress: string;
    subscriberAddress: string;
    tokenAddress: string;
    value: number;
    error: boolean;
}

const settlement = (sequelize: Sequelize) => {
    const model = sequelize.define('settlement', {
        subscriptionId: {
            type: STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        txHash: {
            type: STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
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
        error: {
            type: BOOLEAN,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
            defaultValue: false,
        },
    }, {
        indexes: [
            { fields: ['ownerAddress'] },
            { fields: ['subscriberAddress'] },
            { fields: ['error'] },
        ],
    });

    const addOrUpdateSettlement = async (data: Settlement) => {
        const result = await model.findOne({
            where: {
                subscriptionId: data.subscriptionId,
                txHash: data.txHash,
            },
        });

        if (result) {
            return result.update({
                value: data.value,
                error: data.error,
            });
        }

        return model.create({
            subscriptionId: data.subscriptionId,
            txHash: data.txHash,
            blockHeight: data.blockHeight,
            ownerAddress: data.ownerAddress,
            subscriberAddress: data.subscriberAddress,
            tokenAddress: data.tokenAddress,
            value: data.value,
            error: data.error,
        });
    };

    return {
        model,
        addOrUpdateSettlement,
    };
}

export default settlement;
