import React, {ReactElement, useState} from "react";
import "./header.scss";
import Web3ConnectButton from "../Web3ConnectButton";

export default function Header(): ReactElement {

    return (
        <>
            <div className="header">
                <div className="header__body">
                    <div className="header__logo">Web3Pay</div>
                    <div className="header__content">
                        <Web3ConnectButton />
                    </div>
                </div>
            </div>
        </>
    )
}