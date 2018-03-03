import types from '../actions/types';

const DEFAULT_STATE = {
    auth: false,
    error: ''
};

export default (state = DEFAULT_STATE, action) => {
    switch(action.type){
        case types.LOGIN:
        case types.REGISTER:
            return { auth: true, error: '' };
        case types.AUTH_ERROR:
            return { auth: false, error: action.error };
        case types.LOGOUT:
            return { auth: false, error: '' };
        default:
            return state;
    }
}
