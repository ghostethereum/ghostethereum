import React, {MouseEventHandler, ReactElement, useCallback, useState} from "react";
import Modal from "../Modal";
import "./web3-modal.scss";
import Icon from "../Icon";
import MetamaskIcon from "../../../static/icons/metamask.png";
import SpinnerGif from "../../../static/icons/spinner.gif";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import {useDispatch} from "react-redux";
import {setWeb3} from "../../ducks/web3";

type Props = {
    onClose: () => void;
}

export default function Web3Modal(props: Props): ReactElement {
    const [errorMessage, setErrorMessage] = useState('');
    const [connecting, setConnecting] = useState(false);
    const dispatch = useDispatch();

    const onConnectMetaMask = useCallback(async () => {
        setConnecting(true);

        try {
            const provider = await detectEthereumProvider();

            if (!provider) throw new Error('Please install MetaMask.');

            const web3 = new Web3(provider as any);
            const accounts = await web3.eth.requestAccounts();

            if (!accounts.length) throw new Error('No accounts found');

            dispatch(setWeb3(web3, accounts[0]));
            props.onClose();
        } catch (e) {
            setErrorMessage(e.message);
        }

        setConnecting(false);
    }, []);

    return (
        <Modal
            className="web3-modal"
            onClose={props.onClose}
        >
            <div className="web3-modal__header">
                <div className="web3-modal__header__title">
                    Connect to a wallet
                </div>
                <div className="web3-modal__header__content">
                    <Icon
                        fa="fas fa-times"
                        size={1.25}
                        onClick={props.onClose}
                    />
                </div>
            </div>
            <div className="web3-modal__content">
                <div
                    className="web3-modal__content__row"
                    onClick={onConnectMetaMask}
                >
                    <div className="web3-modal__content__row__name">
                        MetaMask
                    </div>
                    <div className="web3-modal__content__row__icon">
                        <Icon
                            size={2}
                            url={connecting ? SpinnerGif : MetamaskIcon}
                        />
                    </div>
                </div>
                {errorMessage && <small className="error-message">{errorMessage}</small>}
            </div>
            <div className="web3-modal__footer">
                <small>New to Ethereum?</small>
                <small>
                    <a href="https://ethereum.org/en/wallets/" target="_blank">
                        Learn more about wallets
                    </a>
                </small>
            </div>
        </Modal>
    );
}