import Web3 from "web3";
import {useSelector} from "react-redux";
import deepEqual from "fast-deep-equal";
import {AppRootState} from "../store/configureAppStore";

enum ActionTypes {
    SET_WEB3 = 'web3/setWeb3',
}

type Action = {
    type: ActionTypes;
    payload?: any;
    meta?: any;
    error?: boolean;
}

type State = {
    web3: Web3 | null;
    account: string;
}

const initialState: State = {
    web3: null,
    account: '',
};

export const setWeb3 = (web3: Web3 | null, account: string) => ({
    type: ActionTypes.SET_WEB3,
    payload: {
        web3,
        account,
    },
});

export default function web3(state = initialState, action: Action) {
    switch (action.type) {
        case ActionTypes.SET_WEB3:
            return {
                ...state,
                web3: action.payload?.web3,
                account: action.payload?.account,
            };
        default:
            return state;
    }
}

export const useWeb3 = () => {
    return useSelector((state: AppRootState) => {
        return state.web3.web3;
    }, deepEqual);
}

export const useAccount = () => {
    return useSelector((state: AppRootState) => {
        return state.web3.account;
    }, deepEqual);
}
