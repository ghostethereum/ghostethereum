import configs from "../../config.json";
const env = process.env.NODE_ENV || 'development';

type Config = {
    web3HTTPProvider: string;
    web3WSSProvider: string;
    subscriptionContractAddress: string;
    dbHost: string;
    dbDialect: "sqlite" | "mysql" | "postgres" | "mariadb" | "mssql";
    dbStorage: string;
    dbName: string;
    dbUsername: string;
    dbPassword: string;
    supportedTokens: string[];
    pricefeeds: {
        [pair: string]: string;
    };
}
// @ts-ignore
const config: Config = configs[env];
export default config;