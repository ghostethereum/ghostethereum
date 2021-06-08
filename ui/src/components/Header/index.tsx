import React, {ReactElement, useState} from "react";
import "./header.scss";
import Web3ConnectButton from "../Web3ConnectButton";
import {useNetworktype, useWeb3} from "../../ducks/web3";

export default function Header(): ReactElement {
    const networkType = useNetworktype();
    const web3 = useWeb3();

    return (
        <>
            <div className="header">
                <div className="header__body">
                    <div className="header__logo">Ghost Ethereum</div>
                    <div className="header__content">
                        {
                            (!!web3 && networkType !== 'rinkeby') && (
                                <div className="header__network-button">Wrong Network - Switch to Rinkeby</div>
                            )
                        }
                        <Web3ConnectButton />
                    </div>
                </div>
            </div>
        </>
    )
}