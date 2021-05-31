import Web3 from "web3";
import {useSelector} from "react-redux";
import deepEqual from "fast-deep-equal";
import {AppRootState} from "../store/configureAppStore";
import {Dispatch} from "redux";
import {Subscription} from "web3-core-subscriptions";
import {ThunkDispatch} from "redux-thunk";
import ERC20ABI from '../../../util/erc20-abi.json';
import SUBSCRIPTION_ABI from '../../../server/util/subscription-abi.json';
import config from "../../../util/config";

enum ActionTypes {
    SET_WEB3 = 'web3/setWeb3',
    SET_BALANCE = 'web3/setBalance',
    SET_CLAIMABLE = 'web3/setClaimable',
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
    networkType: string;
    balance: {
        [symbol: string]: string;
    };
    claimable: {
        [symbol: string]: string;
    };
}

const initialState: State = {
    web3: null,
    account: '',
    networkType: '',
    balance: {},
    claimable: {},
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

    let networkType = '';

    if (web3) {
        event = web3.eth.subscribe('newBlockHeaders', (err, result) => {
            if (!err) {
               dispatch(fetchSupportedTokens());
               dispatch(fetchClaimable());
            }
        });

        networkType = await web3.eth.net.getNetworkType();

        // @ts-ignore
        web3.currentProvider.on('accountsChanged', ([account]) => {
            dispatch({
                type: ActionTypes.SET_WEB3,
                payload: {
                    web3,
                    account,
                    networkType,
                }
            });
            dispatch(fetchSupportedTokens());
        });

        // @ts-ignore
        web3.currentProvider.on('networkChanged', async ([account]) => {
            const networkType = await web3.eth.net.getNetworkType();
            const accounts = await web3.eth.requestAccounts();

            dispatch({
                type: ActionTypes.SET_WEB3,
                payload: {
                    web3,
                    account: accounts[0],
                    networkType,
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
            networkType,
        }
    });

    await dispatch(fetchSupportedTokens());
    await dispatch(fetchClaimable());
}

export const fetchClaimable = () => async (dispatch: Dispatch, getState: () => AppRootState) => {
    const {web3, account} = getState().web3;

    if (web3) {
        const contract = new web3.eth.Contract(SUBSCRIPTION_ABI, config.subscriptionContractAddress);
        const balance = await contract.methods
            .getClaimableAmount(account, config.supportedTokens[0])
            .call()
            .catch(() => 0);

        dispatch({
            type: ActionTypes.SET_CLAIMABLE,
            payload: {
                symbol: 'DAI',
                balance: balance,
            },
        })
    }
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

export const settleOwnerSubscriptions = () => async (dispatch: Dispatch, getState: () => AppRootState) => {
    const {web3, account} = getState().web3;

    if (web3) {
        const contract = new web3.eth.Contract(SUBSCRIPTION_ABI, config.subscriptionContractAddress);
        await contract.methods.settleOwnerSubscriptions(account).send({
            from: account,
        });
    }
}

export default function web3(state = initialState, action: Action) {
    switch (action.type) {
        case ActionTypes.SET_WEB3:
            return {
                ...state,
                web3: action.payload?.web3,
                account: action.payload?.account,
                networkType: action.payload?.networkType,
            };
        case ActionTypes.SET_BALANCE:
            return {
                ...state,
                balance: {
                    ...state.balance,
                    [action.payload.symbol]: action.payload.balance,
                },
            };
        case ActionTypes.SET_CLAIMABLE:
            return {
                ...state,
                claimable: {
                    ...state.claimable,
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

export const useNetworktype = () => {
    return useSelector((state: AppRootState) => {
        return state.web3.networkType;
    }, deepEqual);
}

export const useBalance = () => {
    return useSelector((state: AppRootState) => {
        return state.web3.balance;
    }, deepEqual);
}

export const useClaimable = () => {
    return useSelector((state: AppRootState) => {
        return state.web3.claimable;
    }, deepEqual);
}
