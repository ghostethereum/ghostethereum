import {GenericService} from "../util/svc";
import Web3  from "web3";
import {Contract} from "web3-eth-contract";
import {Subscription} from "web3-core-subscriptions";
import config from "../util/config";
import subscriptionABI from "../util/subscription-abi.json";
import {parseID} from "../util/contract";

export default class IndexerService extends GenericService {
    web3: Web3;

    subscriptionContract: Contract;

    subscribed?: Subscription<any>;

    queue: any[];

    ingestTimeout: any;

    constructor() {
        super();
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.web3WSSProvider));
        this.subscriptionContract = new this.web3.eth.Contract(
            subscriptionABI as any,
            config.subscriptionContractAddress,
        );
        this.queue = [];
    }

    addEventToQueue(event: any) {
        if (this.ingestTimeout) {
            clearTimeout(this.ingestTimeout);
        }
        this.queue.push(event);
        setTimeout(this.ingestQueue, 1000);
    }

    ingestQueue = async () => {
        this.ingestTimeout = null;
        const queue = this.queue;
        this.queue = [];

        for (let i = 0; i < queue.length; i++) {
            const event = queue[i];
            const {
                ownerAddress,
                subscriberAddress,
                tokenAddress,
            } = parseID(event.returnValues.id);

            switch (event.event) {
                case "SettlementSuccess":
                    await this.call('db', 'addOrUpdateSettlement', {
                        subscriptionId: event.returnValues.id,
                        txHash: event.transactionHash,
                        blockHeight: event.blockNumber,
                        ownerAddress,
                        subscriberAddress,
                        tokenAddress,
                        value: Number(event.returnValues.value),
                        error: false,
                    });
                    break;
                case "SettlementFailure":
                    await this.call('db', 'addOrUpdateSettlement', {
                        subscriptionId: event.returnValues.id,
                        txHash: event.transactionHash,
                        blockHeight: event.blockNumber,
                        ownerAddress,
                        subscriberAddress,
                        tokenAddress,
                        value: Number(event.returnValues.value),
                        error: true,
                    });
                    break;
                case "SubscriptionAdded":
                    await this.call('db', 'addSubscription', {
                        id: event.returnValues.id,
                        txHash: event.transactionHash,
                        blockHeight: event.blockNumber,
                        ownerAddress,
                        subscriberAddress,
                        tokenAddress,
                        value: Number(event.returnValues.value),
                        interval: Number(event.returnValues.interval),
                        cancelled: false,
                    });
                    break;
                case "SubscriptionRemoved":
                    await this.call('db', 'cancelSubscription', event.returnValues.id);
                    break;
            }
        }
    }

    async subscribeEvents(fromBlock: number) {
        this.subscriptionContract.events.allEvents({
            address: config.subscriptionContractAddress,
            fromBlock,
            toBlock: 'latest',
        }, async (error: any, event: any) => {
            if (!error) {
                this.addEventToQueue(event);
            }
        });
    }

    async start() {
        await this.subscribeEvents(8381397);
    }
}