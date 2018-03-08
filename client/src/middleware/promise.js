import types from '../actions/types';

export default store => next => action => {

    if(!action.payload || typeof action.payload.then !== 'function'){
        return next(action);
    }

    action.payload.then( resp => {
        store.dispatch({
            ...action,
            payload: resp
        });
    }).catch(err => {
        store.dispatch({
            type: types.SHEETS_ERROR,
            payload: err.message
        });
    });

    return action.payload;
}
