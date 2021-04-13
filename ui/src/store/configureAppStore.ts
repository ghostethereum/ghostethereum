import {applyMiddleware, combineReducers, createStore} from "redux";
import app from "../ducks/app";
import web3 from "../ducks/web3";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import profiles from "../ducks/profiles";
import tokenData from "../ducks/tokenData";

const rootReducer = combineReducers({
    app,
    web3,
    profiles,
    tokenData,
});

export type AppRootState = ReturnType<typeof rootReducer>;

export default function configureAppStore() {
    return createStore(
        rootReducer,
        process.env.NODE_ENV === 'development'
            ? applyMiddleware(thunk, createLogger({
                collapsed: (getState, action) => [''].includes(action.type),
            }))
            : applyMiddleware(thunk),
    );
}