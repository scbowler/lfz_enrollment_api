import types from './types';
import axios from 'axios';

export function register(cred){
    return async dispatch => {
        try {
            const resp = await axios.post('/auth/register', cred);

            localStorage.setItem('token', resp.data.token);

            dispatch({ type: types.REGISTER });
        } catch (err){
            let errorToSend = ['Unable to create account'];
            if(err.response){
                errorToSend = err.response.data
            }

            dispatch({
                type: types.AUTH_ERROR,
                error: errorToSend
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

export function getCourseList(){
    return async dispatch => {
        try {
            const resp = await axios.get('/api/get-sheet-data', {
                headers: {
                    authorization: localStorage.getItem('token')
                }
            });

            dispatch({
                type: types.GET_ALL_SHEETS,
                payload: resp.data.classList
            });
        } catch(err){
            if (err.response.status === 401){
                return dispatch(logout());
            }
            dispatch({
                type: types.SHEETS_ERROR,
                error: 'Error fetching sheets data'
            });
        }
    }
}

export function syncCourse(course){
    return async dispatch => {
        try {
            const resp = await axios.get(`/api/sync-sheets?sheets=${course}`, {
                headers: {
                    authorization: localStorage.getItem('token')
                }
            });

            dispatch({
                type: types.SYNC_SHEET_INFO,
                course,
                payload: resp.data.data
            });

        } catch(err){
            dispatch({
                type: types.SHEETS_ERROR,
                error: `Error syncing course: ${course}`
            });
        }
    }
}

export function getCourseRoster(courseId, rosterId){
    return async dispatch => {
        try {
            const resp = await axios.post(`/api/get-roster`, {courseId, rosterId}, {
                headers: {
                    authorization: localStorage.getItem('token')
                }
            });

            dispatch({
                type: types.GET_COURSE_ROSTER,
                payload: resp.data.rows
            });
        } catch(err){
            dispatch({
                type: types.SHEETS_ERROR,
                error: `Error getting ${courseId}'s roster for ${rosterId}`
            });
        }
    }
}

export function saveStudentData(data){
    const resp = axios.post('/api/send-data', data);

    return {
        type: types.SAVE_STUDENT_DATA,
        payload: resp
    }
}

export function updateAttended(value, index, roster){
    const resp = axios.post('/api/attendance', {value, index, roster});

    return {
        type: types.UPDATE_ATTENDANCE,
        payload: resp,
        data: { value, index }
    }
}

export function clearAuthError(){
    return { type: types.CLEAR_AUTH_ERROR };
}
