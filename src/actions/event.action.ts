import { createAction } from 'redux-actions';

import { EVENT } from '../constants/actions';

const loged = createAction(EVENT.LOAD);

export const setLoged = (value: boolean) => async (dispatch: any) => {
    await dispatch(loged(value));
    return;
} 