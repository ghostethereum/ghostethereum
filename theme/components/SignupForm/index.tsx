import React, {ReactElement, useCallback, useState} from "react";
import {Plan, Subscription} from "../SubscriptionPlan";
import Web3 from "web3";

type Props = {
    subscription?: Subscription;
    plans: Plan[];
    account: string|null;
    web3: Web3|null;
    web3PayUrl: string;
    themeUUID: string;
    checkSub: (checksum: string) => Promise<void>;
}

export default function SignupForm(props: Props): ReactElement {
    const {
        subscription,
        plans,
        account,
        web3,
        web3PayUrl,
        themeUUID,
        checkSub,
    } = props;

    const [error, setError] = useState('');
    const [email, setEmail] = useState<string|null>(null);

    const onSubmit = useCallback(async () => {
        if (!web3 || !email || !account) {
            return;
        }

        const msgParams = JSON.stringify({
            domain: {
                chainId: 4,
                version: '1',
            },
            primaryType: 'Payload',
            types: {
                EIP712Domain: [
                    { name: 'chainId', type: 'uint' },
                    { name: 'version', type: 'string' },
                ],
                Payload: [
                    { name: 'email', type: 'string' },
                ],
            },
            message: { email },
        });
        const opt = {
            method: 'eth_signTypedData_v4',
            params: [account, msgParams],
            from: account,
        };

        // @ts-ignore
        web3.currentProvider.sendAsync(opt, async (err, response) => {
            if (err) {
                setEmail(null);
                setError(err.payload);
                return;
            }

            try {
                const resp = await fetch(`${web3PayUrl}/ghost/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        uuid: themeUUID,
                        signature: response.result,
                        account: account,
                    }),
                });

                const json = await resp.json();

                if (json.error) {
                    throw new Error(json.payload);
                }
                const checksumAddress = web3.utils.toChecksumAddress(account);
                await checkSub(checksumAddress);
                setEmail(null);
            } catch (e) {
                setEmail(null);
                setError(e.message);
            }
        });
    }, [email, account, web3, web3PayUrl, themeUUID])

    if (!subscription) return <></>;

    if (subscription?.ghostId) {
        return (
            <div className="sign-up-main__email-form__title">
                You've already signed up!
            </div>
        );
    }

    const plan = plans.filter(({ interval }) => interval === subscription.interval)[0];

    return (
        <div className="sign-up-main__email-form">
            <div className="sign-up-main__email-form__title">
                You're subscribed to the {plan.title} plan
            </div>
            <div className="sign-up-main__email-form__subtitle">
                Enter your email below to complete signup
            </div>
            <div className="sign-up-main__email-form__input-label">
                Email
            </div>
            <input
                className="sign-up-main__email-form__input"
                placeholder="joe@example.com"
                type="text"
                onChange={e => setEmail(e.target.value)}
            />
            {error && (
                <div className="sign-up-main__email-form__error">
                    {error}
                </div>
            )}
            <button
                className="sign-up-main__email-form__submit-btn"
                onClick={onSubmit}
            >
                Sign up
            </button>
        </div>
    );
}