import React from 'react';

export function renderInput({ input, type, placeholder, meta: { touched, error } }) {
    return (
        <div className="input-field">
            <input {...input} type={type ? type : 'text'} placeholder={placeholder} />
            <p className="red-text">{touched && error}</p>
        </div>
    )
}

export function getClassName(classId){
    return {
        'enroll-info-session': 'Info Session',
        'root-level-1': 'Root Level 1',
        'root-js': 'Root JS',
        'react-101-register': 'React 101'
    }[classId] || 'Unknown Class Name'
}
