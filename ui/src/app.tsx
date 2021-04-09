import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Root from './pages/Root';
import {BrowserRouter} from 'react-router-dom';
import configureAppStore from "./store/configureAppStore";

const store = configureAppStore();
ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Root />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'),
);

if ((module as any).hot) {
    (module as any).hot.accept();
}