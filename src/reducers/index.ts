import { combineReducers } from 'redux';

import example from './example';
import commands from './commands';
import event from './event';

const reducers = combineReducers({
	example,
	commands,
	event
});

export default reducers;