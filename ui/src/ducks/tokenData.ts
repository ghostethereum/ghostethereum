import {Dispatch} from "redux";
import {AppRootState} from "../store/configureAppStore";
import config from "../../../util/config";
import ERC20ABI from '../../../util/erc20-abi.json';
import {useSelector} from "react-redux";
import deepEqual from "fast-deep-equal";

enum ActionTypes {
    SET_TOKEN_DATA = 'tokenData/setTokenData',
}

type Action = {
    type: ActionTypes;
    payload?: any;
    meta?: any;
    error?: boolean;
}

type State = {
    [symbolOrAddress: string]: {
        symbol: string;
        address: string;
        decimals: number;
    }
}

const initialState: State = {

};

export const fetchSupportedTokens = () => async (dispatch: Dispatch, getState: () => AppRootState) => {
    const {web3} = getState().web3;
    for (let address of config.supportedTokens) {
        const token = new web3.eth.Contract(ERC20ABI, address);
        const symbol = await token.methods.symbol().call();
        const decimals = await token.methods.decimals().call();
        dispatch({
            type: ActionTypes.SET_TOKEN_DATA,
            payload: {
                symbol,
                decimals,
                address,
            }
        })
    }
};

export default function tokenData(state = initialState, action: Action): State {
    switch (action.type) {
        case ActionTypes.SET_TOKEN_DATA:
            return {
                ...state,
                [action.payload.symbol]: action.payload,
                [action.payload.address]: action.payload,
            }
        default:
            return state;
    }
}

export const useTokenData = (symbolOrAddress: string) => {
    return useSelector((state: AppRootState) => {
        return state.tokenData[symbolOrAddress];
    }, deepEqual);
}
