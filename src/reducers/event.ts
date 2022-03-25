import { createReducer } from 'redux-create-reducer';
import update from 'immutability-helper';

import {EVENT} from '../constants/actions';

const initialState = {
    loged: false,
}

const reducers = {
    [EVENT.LOAD]: (state: any, {payload}: any) => update(state, {
        loged: {
            $set: payload
        }
    })
};

export default createReducer(initialState, reducers);