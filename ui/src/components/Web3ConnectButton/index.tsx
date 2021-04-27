import React, {ReactElement, useCallback, useState} from "react";
import "./web3-connect-btn.scss";
import Button from "../Button";
import {setWeb3, useAccount} from "../../ducks/web3";
import Web3 from "web3";
import Identicon from "../Identicon";
import {useDispatch} from "react-redux";
import Web3Modal from "web3modal";
// import WalletConnectProvider from "@walletconnect/web3-provider";


const web3Modal = new Web3Modal({
    network: "rinkeby", // optional
    cacheProvider: false, // optional
    providerOptions: {
        // walletconnect: {
        //     package: WalletConnectProvider,
        //     options: {
        //         infuraId: "c541e55ce2ca4898b17d4deae83289cc",
        //     }
        // },
    },
});


type Props = {

}

export default function Web3ConnectButton(props: Props): ReactElement {
    const account = useAccount();
    const dispatch = useDispatch();

    const disconnect = useCallback(() => {
        dispatch(setWeb3(null, ''));
    }, []);

    const connectWeb3 = useCallback(async () => {
        await web3Modal.clearCachedProvider();
        const provider = await web3Modal.connect();
        const web3 = new Web3(provider);
        const accounts = await web3.eth.requestAccounts();
        if (!accounts.length) throw new Error('No accounts found');
        dispatch(setWeb3(web3, accounts[0]));
    }, []);

    return (
        <>
            {
                account
                    ? (
                        <Button
                            btnType="secondary"
                            className="web3-connect-button web3-connect-button--connected"
                            onClick={disconnect}
                        >
                            <Identicon account={account} diameter={33} />
                            <div>{`${account.slice(0, 8)}...${account.slice(-6)}`}</div>
                        </Button>
                    )
                    : (
                        <Button
                            btnType="secondary"
                            className="web3-connect-button"
                            onClick={connectWeb3}
                        >
                            Connect to a wallet
                        </Button>
                    )
            }
        </>
    );
}