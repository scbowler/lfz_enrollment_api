import types from '../actions/types';

const DEFAULT_STATE = {
    courses: {},
    roster: [],
    error: ''
};

export default (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case types.GET_ALL_SHEETS:
            return {courses: {...action.payload}, roster: [], error: ''};
        case types.SYNC_SHEET_INFO:
            return {...state, courses: {...state.courses, [action.course]: action.payload}};
        case types.GET_COURSE_ROSTER:
            return {roster: action.payload, courses: {}, error: ''};
        case types.SHEETS_ERROR:
            return { ...state, error: action.error };
        default:
            return state;
    }
}
