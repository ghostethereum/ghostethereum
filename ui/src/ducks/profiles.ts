import {Dispatch} from "redux";
import {AppRootState} from "../store/configureAppStore";
import config from "../../../util/config";
import {createProfile} from "../../../util/message-params";
import {useSelector} from "react-redux";
import deepEqual from "fast-deep-equal";

enum ActionTypes {
    ADD_PAYMENT_PROFILES = 'profiles/addPaymentProfiles',
}

type Action = {
    type: ActionTypes;
    payload?: any;
    meta?: any;
    error?: boolean;
}


export type PaymentProfilePayload = {
    id?: string;
    adminUrl: string;
    adminAPIKey: string;
    plans: PaymentPlan[];
}

export type PaymentProfile = PaymentProfilePayload & {
    id: string;
};

export type PaymentPlan = {
    title: 'monthly' | 'yearly' | 'weekly';
    description: string;
    currency: string;
    amount: number;
}

type State = {
    order: string[];
    map: {
        [id: string]: PaymentProfile;
    }
}

const initialState: State = {
    order: [],
    map: {},
};


export const titleToText: {
    [k: string]: string;
} = {
    per_minute: 'By Minute (dev test)',
    monthly: 'Monthly',
    yearly: 'Yearly',
};

export const textToTitle: {
    [k: string]: string;
}  = {
    'By Minute (dev test)': 'per_minute',
    Monthly: 'monthly',
    Yearly: 'yearly',
};

export const fetchPaymentProfiles = () => async (
    dispatch: Dispatch,
    getState: () => AppRootState,
) => {
    const {
        web3: { account, web3 },
        tokenData,
    } = getState();
    const checksum = web3.utils.toChecksumAddress(account);
    const resp = await fetch(`${config.apiUrl}/vendors/${checksum}`);
    const json = await resp.json();

    if (json.error) {
        return;
    }

    dispatch({
        type: ActionTypes.ADD_PAYMENT_PROFILES,
        payload: json.payload.map((profile: any) => ({
            id: profile.id,
            adminUrl: profile.ghostAPI,
            adminAPIKey: profile.ghostAdminAPIKey,
            plans: profile.plans.map((plan: any) => {
                return {
                    title: textToTitle[plan.title],
                    description: plan.description,
                    amount: plan.value / (10 ** tokenData[plan.tokenAddress].decimals),
                    currency: tokenData[plan.tokenAddress].symbol,
                };
            }),
        })),
    });
}

export const createPaymentProfile = (payload: PaymentProfilePayload) => async (
    dispatch: Dispatch,
    getState: () => AppRootState,
) => {
    const {web3, account} = getState().web3;
    const profile = {
        ...payload,
        plans: payload.plans.map(plan => ({
            ...plan,
            amount: String(plan.amount * (10 ** 18)),
            title: titleToText[plan.title],
        }))
    };
    const msgParams = JSON.stringify({
        ...createProfile,
        message: profile,
    });
    const opt = {
        method: 'eth_signTypedData_v4',
        params: [account, msgParams],
        from: account,
    };

    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync(opt, async (err: any, response: any) => {
            console.log(err, response)
            if (err) {
                return reject(err);
            }

            try {
                const resp = await fetch(`${config.apiUrl}/vendors`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...profile,
                        signature: response.result,
                        account: account,
                    }),
                });

                const json = await resp.json();

                if (json.error) {
                    throw new Error(json.payload);
                }

                resolve(json);
            } catch (e) {
                reject(e);
            }

        });
    });
};


export const updatePaymentProfile = (payload: PaymentProfilePayload) => async (
    dispatch: Dispatch,
    getState: () => AppRootState,
) => {
    const {web3, account} = getState().web3;
    const profile = {
        ...payload,
        plans: payload.plans.map(plan => ({
            ...plan,
            amount: String(plan.amount * (10 ** 18)),
            title: titleToText[plan.title],
        }))
    };
    const msgParams = JSON.stringify({
        ...createProfile,
        message: profile,
    });
    const opt = {
        method: 'eth_signTypedData_v4',
        params: [account, msgParams],
        from: account,
    };

    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync(opt, async (err: any, response: any) => {
            if (err) {
                return reject(err);
            }

            try {
                const resp = await fetch(`${config.apiUrl}/profiles/${profile.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...profile,
                        signature: response.result,
                        account: account,
                    }),
                });

                const json = await resp.json();

                if (json.error) {
                    throw new Error(json.payload);
                }

                resolve(json);
            } catch (e) {
                reject(e);
            }

        });
    });
};

export default function profiles(state = initialState, action: Action): State {
    switch (action.type) {
        case ActionTypes.ADD_PAYMENT_PROFILES:
            return {
                ...state,
                order: action.payload.map(({ id }: PaymentProfile) => id),
                map: action.payload.reduce((map: {[id: string]: PaymentProfile}, profile: PaymentProfile) => {
                    map[profile.id] = profile;
                    return map;
                }, {}),
            }
        default:
            return state;
    }
}



export const useProfileIDs = () => {
    return useSelector((state: AppRootState) => {
        return state.profiles.order;
    }, deepEqual)
}


export const useProfileById = (id: string) => {
    return useSelector((state: AppRootState) => {
        return state.profiles.map[id];
    }, deepEqual)
}
