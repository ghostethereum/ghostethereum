import ReactDOM from "react-dom";
import React from "react";
import AccountPage from "./components/AccountPage";

const el = document.querySelector('#account');
// @ts-ignore
const email = el?.dataset?.memberEmail;

ReactDOM.render(
    <AccountPage
        themeUUID="{{THEME_UUID}}"
        web3PayUrl="{{THEME_WEB3_PAY_URL}}"
        contractAddress="{{THEME_CONTRACT_ADDRESS}}"
        email={email}
    />,
    el,
);