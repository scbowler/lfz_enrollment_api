import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import sheets from './sheet_data_reducer';
import user from './user_reducer';

export default combineReducers({ form, sheets, user });
