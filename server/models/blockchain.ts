import {Sequelize, BIGINT} from "sequelize";

const blockchain = (sequelize: Sequelize) => {
    const model = sequelize.define('blockchain', {
        lastBlockScanned: {
            type: BIGINT,
        },
    }, {});

    const findLastBlock = async () => {
        let result = await model.findOne();
        return result?.toJSON();
    }

    const updateLastBlock = async (blockHeight: number) => {
        const result = await model.findOne();

        if (result) {
            return result.update({
               lastBlockScanned: blockHeight,
            });
        }

        return model.create({
            lastBlockScanned: blockHeight,
        });
    }

    return {
        model,
        findLastBlock,
        updateLastBlock,
    };
}

export default blockchain;
