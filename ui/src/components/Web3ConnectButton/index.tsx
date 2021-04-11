import React, {ReactElement, useCallback, useState} from "react";
import "./web3-connect-btn.scss";
import Button from "../Button";
import Web3Modal from "../Web3Modal";
import {setWeb3, useAccount} from "../../ducks/web3";
import Identicon from "../Identicon";
import {useDispatch} from "react-redux";

type Props = {

}

export default function Web3ConnectButton(props: Props): ReactElement {
    const [isShowingModal, setShowingModal] = useState(false);
    const account = useAccount();
    const dispatch = useDispatch();

    const disconnect = useCallback(() => {
        dispatch(setWeb3(null, ''));
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
                            onClick={() => setShowingModal(true)}
                        >
                            Connect to a wallet
                        </Button>
                    )
            }
            { isShowingModal && <Web3Modal onClose={() => setShowingModal(false)} />}
        </>
    );
}