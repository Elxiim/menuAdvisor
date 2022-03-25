import { createAction } from 'redux-actions';
import _keyBy from 'lodash.keyby';

import { TEST } from '../constants/actions';

const someAction = createAction(TEST.ACTION_NAME);

export const doSomethingOrRequest = (params: any) => async (dispatch: any) => {
    const res = 'fetch';
    await dispatch(someAction(res));
    return true;
} 