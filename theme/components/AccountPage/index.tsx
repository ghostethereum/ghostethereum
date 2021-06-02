import React, {ReactElement, useCallback, useEffect, useState} from "react";
import Web3ConnectButton, {ERC20_ABI, getTokenInfo} from "../Web3ConnectButton";
import Web3 from "web3";
import SUBSCRIPTION_ABI from "../../../server/util/subscription-abi.json";
import {AbiItem} from "web3-utils";
import {Subscription} from "../SubscriptionPlan";
import Spinner from "../Spinner";

type Props = {
    themeUUID: string;
    web3PayUrl: string;
    contractAddress: string;
    email: string;
}

export default function AccountPage(props: Props): ReactElement {
    const {
        themeUUID,
        web3PayUrl,
        contractAddress,
        email,
    } = props;

    const [subscribed, setSubscribed] = useState(false);
    const [account, setAccount] = useState('');
    const [tokenAddress, setTokenAddress] = useState('');
    const [subscription, setSubscription] = useState<Subscription|null>(null);
    const [web3, setWeb3] = useState<Web3|null>(null);

    const [balance, setBalance] = useState(0);
    const [decimals, setDecimals] = useState(18);
    const [symbol, setSymbol] = useState('DAI');

    const [lastSettlementAmount, setLastSettlementAmount] = useState(0);
    const [lastSettlementTX, setLastSettlementTX] = useState('');

    const [cancelling, setCancelling] = useState(false);
    const [cancelTX, setCancelTX] = useState('');

    const setWeb3Account = useCallback((web3Account: string) => {
        if (web3Account === subscription?.subscriberAddress) {
            setAccount(web3Account);
        }
    }, [subscription?.subscriberAddress]);

    const cancelSubscription = useCallback(async () => {
        if (!web3 || !contractAddress || !account || !subscription || cancelling) return;

        setCancelling(true);

        const contract = new web3.eth.Contract(SUBSCRIPTION_ABI as AbiItem[], contractAddress);
        await contract.methods
            .removeSubscription(
                web3.utils.hexToBytes(subscription.id),
            )
            .send({ from: account })
            .on('error', () => {
                setCancelling(false);
            })
            .on('transactionHash', (hash: string) => {
                localStorage.setItem('cancelTX', hash);
                setCancelling(false);
                setCancelTX(hash);
            });
    }, [web3, subscription, contractAddress, account, cancelling])

    useEffect(() => {
        (async function onAccountPageMount() {
            const resp = await fetch(`${web3PayUrl}/ghost/member/${themeUUID}?email=${email}`);
            const json = await resp.json();
            const {member, subscription, lastSettlement} = json.payload;
            setSubscribed(member?.subscribed);
            setSubscription(subscription);
            setTokenAddress(subscription.tokenAddress);
            setLastSettlementAmount(lastSettlement?.value || 0);
            setLastSettlementTX(lastSettlement?.txHash);
        })();
    }, [
        themeUUID,
        web3PayUrl,
        contractAddress,
        email,
    ]);

    useEffect(() => {
        (async function onWeb3Connected() {
            if (!web3 || !account || !tokenAddress || !contractAddress) return;
            const token = await getTokenInfo(web3, account, tokenAddress, contractAddress);
            const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
            const decimals = await tokenContract.methods.decimals().call();
            const symbol = await tokenContract.methods.symbol().call();
            setBalance(token.balance);
            setDecimals(decimals);
            setSymbol(symbol);
        })();
    }, [web3, tokenAddress, contractAddress, account])

    let unit: string = '';
    const {interval = 0} = subscription || {};
    if (interval === 60) {
        unit = 'minute';
    } else if (interval === 60 * 60 * 24 * (365/12)) {
        unit = 'month';
    } else if (interval === 60 * 60 * 24 * 365) {
        unit = 'year';
    } else {
        unit = `${interval} seconds`;
    }

    const address = subscription?.subscriberAddress || '';

    return (
        <div className="account-page">
            <Web3ConnectButton
                web3={web3}
                setWeb3={setWeb3}
                account={account}
                setAccount={setWeb3Account}
                tokenAddress={tokenAddress}
                balance={balance}
                decimals={decimals}
                symbol={symbol}
            />
            <div className="account-page__content">
                <div className="account-page__group">
                    <div className="account-page__group__info">
                        <div className="account-page__group__title">
                            Email
                        </div>
                        <div className="account-page__group__value">
                            {props.email}
                        </div>
                    </div>
                </div>
                <div className="account-page__group">
                    <div className="account-page__group__info">
                        <div className="account-page__group__title">
                            Subscriber Account
                        </div>
                        <div className="account-page__group__value">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </div>
                    </div>
                </div>
                <div className="account-page__group">
                    <div className="account-page__group__info">
                        <div className="account-page__group__title">
                            Plan
                        </div>
                        <div className="account-page__group__value">
                            {`${(subscription?.value || 0) / (10 ** decimals)} ${symbol} per ${unit}`}
                        </div>
                    </div>
                    <div className="account-page__group__action">
                        {
                            !!web3 && !!account && (
                                <a
                                    href="javascript:"
                                    onClick={cancelSubscription}
                                >
                                    {cancelling ? <Spinner /> : 'Cancel'}
                                </a>
                            )
                        }
                    </div>
                </div>

                <div className="account-page__group">
                    <div
                        className="account-page__group__info clickable"
                        onClick={() => window.open(`https://rinkeby.etherscan.io/tx/${lastSettlementTX}`, '_blank')}
                    >
                        <div className="account-page__group__title">
                            Last Payment
                        </div>
                        <div className="account-page__group__value">
                            {lastSettlementAmount/(10 ** decimals)} {symbol}
                        </div>
                    </div>
                </div>
                <div className="account-page__group">
                    <div className="account-page__group__info">
                        <div className="account-page__group__title">
                            Email newsletter
                        </div>
                        <div className="account-page__group__value">
                            {subscribed ? 'Subscribed' : 'Unsubscribed'}
                        </div>
                    </div>
                </div>
            </div>
            <div className="account-page__footer">
                <button className="account-page__sign-out" data-members-signout>
                    Sign out
                </button>
            </div>
        </div>
    )
}