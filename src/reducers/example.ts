import { createReducer } from 'redux-create-reducer';
import update from 'immutability-helper';

import {TEST} from '../constants/actions';

const initialState = {
    message: {}
}

const reducers = {
    [TEST.ACTION_NAME]: (state: any, {payload}: any) => update(state, {
        message: {
            $merge: payload
        }
    })
};

export default createReducer(initialState, reducers);