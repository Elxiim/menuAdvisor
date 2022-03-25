import { createReducer } from 'redux-create-reducer';
import update from 'immutability-helper';

import {COMMANDS} from '../constants/actions';

const initialState = {
    all: [],
    delivery: [],
    takeaway: [],
    onSite: [],
    isLoaded: false,
    restoOptions: []
}

const reducers = {
    [COMMANDS.LOAD]: (state: any, {payload: {delivery, takeaway, onSite, isLoaded, restoOptions}}: any) => update(state, {
        all: {
            $merge: [...delivery, ...takeaway, ...onSite]
        },
        delivery: {
            $merge: delivery
        },
        takeaway: {
            $merge: takeaway
        },
        onSite: {
            $merge: onSite
        },
        isLoaded: {
            $set: isLoaded
        },
        restoOptions: {
            $merge: restoOptions
        }
    })
};

export default createReducer(initialState, reducers);