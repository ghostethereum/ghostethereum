import React, {ReactElement, useState} from "react";
import Header from "../../components/Header";
import "./root.scss";
import {Redirect, Route, Switch} from "react-router";
import Button from "../../components/Button";
import {useAccount, useWeb3} from "../../ducks/web3";
import Web3Modal from "../../components/Web3Modal";
import Web3ConnectButton from "../../components/Web3ConnectButton";
import Dashboard from "../Dashboard";

export default function Index(): ReactElement {
    const web3 = useWeb3();
    const account = useAccount();
    return (
        <div className="root">
            <Header />
            {!web3 && !account && <UnauthContent />}
            {web3 && account && <Content />}
        </div>
    );
}

function UnauthContent(): ReactElement {
    const [isShowingModal, setShowingModal] = useState(false);
    return (
        <div className="content">
            <div className="content__unauthenticated">
                <Web3ConnectButton />
            </div>
        </div>
    )
}

function Content(): ReactElement {
    return (
        <div className="content">
            <Switch>
                <Route path="/">
                    <Dashboard />
                </Route>
                <Route>
                    <Redirect to="/" />
                </Route>
            </Switch>
        </div>
    )
}