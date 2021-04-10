import {GenericService} from "../util/svc";
import Web3  from "web3";
import {Contract} from "web3-eth-contract";
import {Subscription} from "web3-core-subscriptions";
import config from "../util/config";
import subscriptionABI from "../util/subscription-abi.json";

export default class IndexerService extends GenericService {
    web3: Web3;

    subscriptionContract: Contract;

    subscribed?: Subscription<any>;

    constructor() {
        super();
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.web3WSSProvider));
        this.subscriptionContract = new this.web3.eth.Contract(
            subscriptionABI as any,
            config.subscriptionContractAddress,
        );
    }

    async getPastLogs(fromBlock: number) {
        const events = await this.subscriptionContract.getPastEvents('SubscriptionAdded', {
            address: config.subscriptionContractAddress,
            fromBlock,
            toBlock: 'latest',
        });
    }

    async subscribeEvents() {
        this.subscribed = this.web3.eth.subscribe('logs', {
            address: config.subscriptionContractAddress,
        }, (error, result) => {
            console.log({result});
        });
    }

    async start() {
        // wait this.subscribeEvents();
        // await this.getPastLogs(8381397);
    }
}