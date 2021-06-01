import ReactDOM from "react-dom";
import React from "react";
import SubscribePage from "./components/SubscribePage";

ReactDOM.render(
    <SubscribePage
        themeUUID="{{THEME_UUID}}"
        web3PayUrl="{{THEME_WEB3_PAY_URL}}"
        contractAddress="{{THEME_CONTRACT_ADDRESS}}"
    />,
    document.querySelector('#sign-up'),
);