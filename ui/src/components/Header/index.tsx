import React, {ReactElement, useState} from "react";
import "./header.scss";
import Button from "../Button";
import Web3Modal from "../Web3Modal";

export default function Header(): ReactElement {
    const [isShowingModal, setShowingModal] = useState(false);

    return (
        <>
            <div className="header">
                <div className="header__body">
                    <div className="header__logo">Web3Pay</div>
                    <div className="header__content">
                        <Button
                            btnType="secondary"
                            onClick={() => setShowingModal(true)}
                        >
                            Connect to a wallet
                        </Button>
                    </div>
                </div>
            </div>
            { isShowingModal && <Web3Modal onClose={() => setShowingModal(false)} />}
        </>
    )
}