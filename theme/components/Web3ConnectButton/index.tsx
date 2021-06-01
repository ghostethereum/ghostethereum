import React, {ReactElement, useCallback, useEffect, useState} from "react";
import Web3 from "web3";
import {AbiItem} from 'web3-utils';
import Web3Modal from "web3modal";
import Spinner from "../Spinner";
import Identicon from "../../../ui/src/components/Identicon";

const web3Modal = new Web3Modal({
    network: "rinkeby", // optional
    cacheProvider: false, // optional
    providerOptions: {
    },
});

export const ERC20_ABI: AbiItem[] = [
    {
        "constant":true,
        "inputs":[{"name":"_owner","type":"address"}],
        "name":"balanceOf",
        "outputs":[{"name":"balance","type":"uint256"}],
        "type":"function"
    },
    {
        "constant":true,
        "inputs":[],
        "name":"decimals",
        "outputs":[{"name":"","type":"uint8"}],
        "type":"function"
    },
    {
        "constant":true,
        "inputs":[],
        "name":"symbol",
        "outputs":[{"name":"","type":"string"}],
        "type":"function"
    },
    {
        "constant": false,
        "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
];

type Props = {
    web3: Web3 | null;
    setWeb3: (web3: Web3) => void;
    account: string | null;
    setAccount: (account: string) => void;
    tokenAddress: string;
    balance: number;
    decimals: number;
    symbol: string;
}

export default function Web3ConnectButton(props: Props): ReactElement {
    const {
        web3,
        setWeb3,
        account,
        setAccount,
        balance,
        decimals,
        symbol,
    } = props;

    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        (async function onWeb3Connected() {
            if (!web3) return;
            const account = await requestAccounts(web3);
            setAccount(account);
        })();
    }, [web3]);

    const connectWeb3 = useCallback(async () => {
        setLoading(true);
        try {
            await web3Modal.clearCachedProvider();
            const provider = await web3Modal.connect();
            const web3 = new Web3(provider);
            setWeb3(web3);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }, []);

    if (!account || !web3) {
        return (
            <div className="web3-button-root">
                <div className="web3-btn-wrapper" data-ref-web3-btn>
                    <button className="web3-btn" onClick={connectWeb3}>
                        {isLoading ? <Spinner />: 'Connect to a wallet'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="web3-button-root">
            <div className="web3-btn-wrapper" data-ref-web3-btn>
                <div className="web3-btn-wrapper__balance">
                    {balance / (10 ** decimals)} {symbol}
                </div>
                <button className="web3-btn-wrapper__address">
                    {account.slice(0, 6)}...{account.slice(-6)}
                    <Identicon account={account} diameter={28} />
                </button>
            </div>
        </div>
    );
}

export async function requestAccounts(web3: Web3): Promise<string> {
    const accounts = await web3.eth.requestAccounts();
    if (!accounts.length) throw new Error('No accounts found');
    return accounts[0];
}

export async function getTokenInfo(
    web3: Web3,
    account: string,
    tokenAddress: string,
    contractAddress: string,
): Promise<{
    balance: number;
    allowance: number;
}> {
    const token = new web3.eth.Contract(ERC20_ABI, tokenAddress);
    const balance = await token.methods.balanceOf(account).call();
    const allowance = await token.methods.allowance(account, contractAddress).call();
    console.log(tokenAddress, balance, allowance);
    return { balance, allowance };
}

