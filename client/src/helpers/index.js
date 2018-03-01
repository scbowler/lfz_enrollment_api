import React from 'react';

export function renderInput({ input, type, placeholder, meta: { touched, error } }) {
    return (
        <div className="input-field">
            <input {...input} type={type ? type : 'text'} placeholder={placeholder} />
            <p className="red-text">{touched && error}</p>
        </div>
    )
}
