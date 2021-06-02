import React, {MouseEventHandler, ReactElement, ReactNode, useEffect, useState} from "react";
import {fromWei} from "../../../ui/src/util/number";
import Spinner from "../Spinner";

type Props = {
    plan: Plan;
    approveTX: string|null;
    subscribeTX: string|null;
    allowance: number;
    approving: boolean;
    subscribing: boolean;
    webConnected: boolean;
    onApprove: MouseEventHandler;
    onSubscribe: (plan: Plan) => Promise<void>;
}

export type Plan = {
    createdAt: string;
    description: string;
    id: string;
    interval: number;
    ownerAddress: string;
    ownerId: string;
    title: string;
    tokenAddress: string;
    tokenDecimals: number;
    tokenSymbol: string;
    updatedAt: string;
    value: number;
}

export type Subscription = {
    blockHeight: number;
    cancelled: boolean;
    createdAt: string;
    ghostId: string | null;
    id: string;
    interval: number;
    ownerAddress: string;
    subscriberAddress: string;
    tokenAddress: string;
    txHash: string;
    updatedAt: string;
    value: number;
}

export default function SubscriptionPlan(props: Props): ReactElement {
    const {plan} = props;


    return (
        <div className="sign-up-main__plan-option">
            <div className="sign-up-main__plan-option__price">
                {fromWei(plan.value)} {plan.tokenSymbol}
            </div>
            <div className="sign-up-main__plan-option__type">
                {plan.title}
            </div>
            <div className="sign-up-main__plan-option__subtitle">
                {plan.description}
            </div>
            <div data-ref-plan-select-btn>
                {renderButton(props)}
            </div>
        </div>
    );
}

function renderButton(props: Props): ReactNode {
    const {
        approving,
        approveTX,
        subscribing,
        subscribeTX,
        allowance,
        plan,
        webConnected,
    } = props;
    const {
        value,
    } = plan;

    if (!webConnected) {
        return (
            <button
                className="sign-up-main__plan-option__select-btn"
                disabled
            >
                Select
            </button>
        )
    }

    if (approveTX) {
        return (
            <button
                className="sign-up-main__plan-option__approve-pending-btn"
                onClick={() => window.open(`https://rinkeby.etherscan.io/tx/${approveTX}`, '_blank')}
            >
                TX pending <Spinner />
            </button>
        );
    }

    if (approving) {
        return (
            <button
                className="sign-up-main__plan-option__approve-btn"
            >
                <Spinner />
            </button>
        )
    }

    if (subscribeTX) {
        return (
            <button
                className="sign-up-main__plan-option__subscribe-pending-btn"
                onClick={() => window.open(`https://rinkeby.etherscan.io/tx/${subscribeTX}`, '_blank')}
            >
                TX pending <Spinner />
            </button>
        );
    }

    if (allowance < value) {
        return (
            <button
                className="sign-up-main__plan-option__approve-btn"
                onClick={props.onApprove}
            >
                Approve
            </button>
        );
    }

    if (subscribing) {
        return (
            <button
                className="sign-up-main__plan-option__select-pending-btn"
            >
                <Spinner />
            </button>
        );
    }

    if (webConnected) {
        return (
            <button
                className="sign-up-main__plan-option__select-btn"
                onClick={() => props.onSubscribe(plan)}
            >
                Subscribe
            </button>
        )
    }

    return (
        <button
            className="sign-up-main__plan-option__select-btn"
            disabled
        >
            Select
        </button>
    )
}