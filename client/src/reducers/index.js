import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import sheet from './sheet_data_reducer';
import user from './user_reducer';

export default combineReducers({ form, sheet, user });
