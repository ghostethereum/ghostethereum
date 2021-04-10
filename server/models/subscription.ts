import {Sequelize, Model, BIGINT, STRING, BOOLEAN} from "sequelize";

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

    return {
        model,
    };
}

export default subscription;
