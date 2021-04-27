import Web3 from "web3";
import {useSelector} from "react-redux";
import deepEqual from "fast-deep-equal";
import {AppRootState} from "../store/configureAppStore";
import {Dispatch} from "redux";
import {Subscription} from "web3-core-subscriptions";
import {ThunkDispatch} from "redux-thunk";
import ERC20ABI from '../../../util/erc20-abi.json';
import config from "../../../util/config";

enum ActionTypes {
    SET_WEB3 = 'web3/setWeb3',
    SET_BALANCE = 'web3/setBalance',
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
    balance: {
        [symbol: string]: string;
    };
}

const initialState: State = {
    web3: null,
    account: '',
    balance: {},
};

let event: Subscription<any> | null;

export const setWeb3 = (web3: Web3 | null, account: string) => async (
    dispatch: ThunkDispatch<any, any, any>,
) => {
    if (event) {
        await event.unsubscribe((err, result) => {
            console.log('unsubscribed');
        });
        event = null;
    }

    if (web3) {
        await dispatch(fetchSupportedTokens());

        event = web3.eth.subscribe('newBlockHeaders', (err, result) => {
            if (!err) {
               dispatch(fetchSupportedTokens());
            }
        });

        // @ts-ignore
        web3.currentProvider.on('accountsChanged', ([account]) => {
            dispatch({
                type: ActionTypes.SET_WEB3,
                payload: {
                    web3,
                    account,
                }
            });
            dispatch(fetchSupportedTokens());
        });
    }

    dispatch({
        type: ActionTypes.SET_WEB3,
        payload: {
            web3,
            account,
        }
    });
}

export const fetchSupportedTokens = () => async (
    dispatch: ThunkDispatch<any, any, any>,
) => {
    for (let tokenAddress of config.supportedTokens) {
        await dispatch(fetchERC20Balance(tokenAddress));
    }
}

export const fetchERC20Balance = (tokenAddress?: string) => async (dispatch: Dispatch, getState: () => AppRootState) => {
    const {web3, account} = getState().web3;

    if (!tokenAddress) {
        console.error('TOKEN_ADDRESS is null');
        return;
    }

    if (web3) {
        const token = new web3.eth.Contract(ERC20ABI, tokenAddress);
        const balance = await token.methods.balanceOf(account).call();
        const symbol = await token.methods.symbol().call();
        // const decimals = await token.methods.decimals().call();

        dispatch({
            type: ActionTypes.SET_BALANCE,
            payload: {
                symbol: symbol || 'Unknown',
                // decimals: +decimals,
                balance: balance,
            },
        })
    }
}

export const fetchETHBalance = () => async (dispatch: Dispatch, getState: () => AppRootState) => {
    const {web3, account} = getState().web3;

    if (web3) {
        const result = await web3.eth.getBalance(account);
        dispatch({
            type: ActionTypes.SET_BALANCE,
            payload: {
                symbol: 'ETH',
                balance: result,
                decimals: 18,
            },
        })
    }
}

export default function web3(state = initialState, action: Action) {
    switch (action.type) {
        case ActionTypes.SET_WEB3:
            return {
                ...state,
                web3: action.payload?.web3,
                account: action.payload?.account,
            };
        case ActionTypes.SET_BALANCE:
            return {
                ...state,
                balance: {
                    ...state.balance,
                    [action.payload.symbol]: action.payload.balance,
                },
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

export const useBalance = () => {
    return useSelector((state: AppRootState) => {
        return state.web3.balance;
    }, deepEqual);
}
