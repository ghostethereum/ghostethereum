enum ActionTypes {

}

type Action = {
    type: ActionTypes;
    payload?: any;
    meta?: any;
    error?: boolean;
}

type State = {

}

const initialState: State = {

};

export default function app(state = initialState, action: Action) {
    switch (action) {
        default:
            return state;
    }
}
