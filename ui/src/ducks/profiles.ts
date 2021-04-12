import {Dispatch} from "redux";
import {AppRootState} from "../store/configureAppStore";
import config from "../../../util/config";
import {createProfile} from "../../../util/message-params";

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


const titleToText: {
    [k: string]: string;
} = {
    monthly: 'Monthly',
    yearly: 'Yearly',
};

export const fetchPaymentProfiles = () => async (
    dispatch: Dispatch,
    getState: () => AppRootState,
) => {
    const {account} = getState().web3;
    const resp = await fetch(`${config.apiUrl}/vendors/${account}`);
    const json = await resp.json();
    console.log(json);
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

export default function profiles(state = initialState, action: Action): State {
    switch (action.type) {
        case ActionTypes.ADD_PAYMENT_PROFILES:
            return {
                ...state,
                order: action.payload.profiles.map(({ id }: PaymentProfile) => id),
                map: action.payload.profiles.reduce((map: {[id: string]: PaymentProfile}, profile: PaymentProfile) => {
                    map[profile.id] = profile;
                    return map;
                }, {}),
            }
        default:
            return state;
    }
}
