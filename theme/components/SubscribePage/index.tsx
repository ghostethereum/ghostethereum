import React, {ReactElement, useCallback, useEffect, useState} from "react";
import SubscriptionPlan, {Plan} from "../SubscriptionPlan";
import Web3 from "web3";
import Web3ConnectButton, {ERC20_ABI, getTokenInfo, requestAccounts} from "../Web3ConnectButton";
import BN from "bignumber.js";
import SUBSCRIPTION_ABI from "../../../server/util/subscription-abi.json";
import {AbiItem} from "web3-utils";
import plan from "../../../server/models/plan";

type Props = {
    themeUUID: string;
    web3PayUrl: string;
    contractAddress: string;
}

export default function SubscribePage(props: Props): ReactElement {
    const {
        themeUUID,
        web3PayUrl,
        contractAddress,
    } = props;

    const [web3, setWeb3] = useState<Web3|null>(null);
    const [account, setAccount] = useState<string|null>(null);
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [allowance, setAllowance] = useState<number>(0);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [approveTX, setApproveTX] = useState<string|null>(null);
    const [subscribeTX, setSubscribeTX] = useState<string|null>(null);
    const [approving, setApproving] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    const [balance, setBalance] = useState(0);
    const [decimals, setDecimals] = useState(18);
    const [symbol, setSymbol] = useState('DAI');

    useEffect(() => {
        (async function onWeb3Connect() {
            if (!web3 || !tokenAddress) return;

            const account = await requestAccounts(web3);
            const token = await getTokenInfo(web3, account, tokenAddress, contractAddress);
            setAccount(account);
            setBalance(token.balance);
            setAllowance(token.allowance);

            // @ts-ignore
            web3.currentProvider.on('accountsChanged', async ([account]) => {
                console.log('account changed');
                const token = await getTokenInfo(web3, account, tokenAddress, contractAddress);
                setAccount(account);
                setBalance(token.balance);
                setAllowance(token.allowance);
                setAccount(account);
            });
        })();
    }, [web3, tokenAddress, contractAddress]);

    useEffect(() => {
        (async function onSubscribePageMount() {
            const resp = await fetch(`${web3PayUrl}/plans/${themeUUID}`);
            const json = await resp.json();
            setApproveTX(localStorage.getItem('approveTX'));
            setSubscribeTX(localStorage.getItem('subscribeTX'));
            setPlans(json.payload);

            const plan: Plan = json.payload[0];
            setTokenAddress(plan.tokenAddress);
            setSymbol(plan.tokenSymbol);
            setDecimals(plan.tokenDecimals);
        })();
    }, []);

    const onApprove = useCallback(async () => {
        if (!web3 || !tokenAddress || !account || approving) {
            return;
        }

        setApproving(true);

        const token = new web3.eth.Contract(ERC20_ABI, tokenAddress);
        await token.methods
            .approve(contractAddress, new BN(999999999 * 10 ** 18).toFixed())
            .send({ from: account })
            .on('error', () => {
                setApproving(false);
                setApproveTX(null);
            })
            .on('receipt', () => {
                localStorage.setItem('approveTX', '');
                setApproving(false);
                setApproveTX(null);
            })
            .on('transactionHash', (hash: string) => {
                localStorage.setItem('approveTX', hash);
                setApproving(false);
                setApproveTX(hash);
            });
    }, [web3, tokenAddress, approving, account])

    const onSubscribe = useCallback(async (plan: Plan) => {
        if (!web3 || !contractAddress) return;

        setSubscribing(true);

        const {
            ownerAddress,
            tokenAddress,
            value,
            interval,
        } = plan;

        const contract = new web3.eth.Contract(SUBSCRIPTION_ABI as AbiItem[], contractAddress);
        await contract.methods
            .addSubscription(
                ownerAddress,
                tokenAddress,
                value,
                interval,
                web3.utils.hexToBytes('0x' + themeUUID.replace(/-/g, '')),
            )
            .send({ from: account })
            .on('error', () => {
                setSubscribing(false);
            })
            .on('transactionHash', (hash: string) => {
                localStorage.setItem('subscribeTX', hash);
                setSubscribing(false);
                setSubscribeTX(hash);
            });
    }, [web3, themeUUID, contractAddress, account]);

    return (
        <div className="sign-up-main__content">
            <p className="sign-up-main__description">
                Get the email newsletter and unlock access to member-only content.
            </p>
            <Web3ConnectButton
                web3={web3}
                setWeb3={setWeb3}
                account={account}
                setAccount={setAccount}
                tokenAddress={tokenAddress}
                balance={balance}
                symbol={symbol}
                decimals={decimals}
            />
            <div className="sign-up-main__plan-options-root">
                {
                    !!plans.length && plans.map(plan => (
                        <SubscriptionPlan
                            plan={plan}
                            approving={approving}
                            approveTX={approveTX}
                            subscribing={subscribing}
                            subscribeTX={subscribeTX}
                            allowance={allowance}
                            webConnected={!!web3}
                            onApprove={onApprove}
                            onSubscribe={onSubscribe}
                        />
                    ))
                }
            </div>
            <p className="mb0">Already a member? <a href="/#/portal/signin">Please sign in →</a></p>
        </div>
    );
}