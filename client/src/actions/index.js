import types from './types';
import axios from 'axios';

export function register(cred){
    return async dispatch => {
        try {
            const resp = await axios.post('/auth/register', cred);

            localStorage.setItem('token', resp.data.token);

            dispatch({ type: types.REGISTER });
        } catch (err){
            dispatch({
                type: types.AUTH_ERROR,
                error: 'Unable to create account'
            });
        }
    }
}

export function login(cred){
    return async dispatch => {
        try {
            const resp = await axios.post('/auth/login', cred);

            localStorage.setItem('token', resp.data.token);

            dispatch({ type: types.LOGIN });
        } catch(err){
            dispatch({
                type: types.AUTH_ERROR,
                error: 'Invalid email and/or password'
            });
        }
    }
}

export function logout(){

    localStorage.removeItem('token');

    return {
        type: types.LOGOUT
    };
}

export function test(){
    return async dispatch => {
        const resp = await axios.get('/api/test-route', {
            headers: {
                authorization: localStorage.getItem('token')
            }
        });

        console.log('Test Resp:', resp);
    }
}
