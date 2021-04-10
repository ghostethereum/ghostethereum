import {Sequelize, Model, BIGINT, STRING, DATE, BOOLEAN} from "sequelize";

const settlement = (sequelize: Sequelize) => {
    const model = sequelize.define('settlement', {
        subscriptionId: {
            type: STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        settledAt: {
            type: DATE,
            allowNull: false,
            validate: {
                notEmpty: true,
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

    return {
        model,
    };
}

export default settlement;
