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

    async subscribeEvents(fromBlock: number) {
        this.subscriptionContract.events.allEvents({
            address: config.subscriptionContractAddress,
            fromBlock,
            toBlock: 'latest',
        }, (error: any, event: any) => {
            switch (event.event) {
                case "SettlementSuccess":
                    console.log(event.event, event.returnValues);
                    return;
                case "SettlementFailure":
                    console.log(event.event, event.returnValues);
                    return;
                case "SubscriptionAdded":
                    console.log(event.event, event.returnValues);
                    return;
                case "SubscriptionRemoved":
                    console.log(event.event, event.returnValues);
                    return;
            }
        });
    }

    async start() {
        await this.subscribeEvents(8381397);
    }
}