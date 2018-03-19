import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import { renderInput } from '../helpers';
import { register, clearAuthError } from '../actions';

class Register extends Component {

    handleRegister(vals) {
        this.props.register(vals);
    }

    componentWillUnmount(){
        this.props.clearAuthError();
    }

    render() {
        const linkStyle = {
            marginRight: '8px'
        }
        const { handleSubmit, authError } = this.props;

        return (
            <div>
                <h1 className="center-align">Register</h1>
                <div className="row">
                    <div className="col s6 offset-s3">
                        <div className="card grey lighten-3">
                            <div className="card-content">
                                <form onSubmit={handleSubmit(this.handleRegister.bind(this))}>
                                    <Field component={renderInput} name="email" placeholder="Enter your email" />
                                    <Field component={renderInput} name="password" placeholder="Choose a password" type="password" />
                                    <Field component={renderInput} name="confirmPassword" placeholder="Confirm your password" type="password" />
                                    <div className="right-align">
                                        <Link style={linkStyle} className="blue-grey-text text-darken-1" to="/">Cancel</Link>
                                        <button className="btn blue-grey darken-1">Register</button>
                                        <p className="red-text">{authError}</p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function validate(vals){
    const errors = {};

    if(!vals.email){
        errors.email = 'Please enter an email';
    }

    if(!vals.password){
        errors.password = 'Please enter a password';
    }

    if(vals.password !== vals.confirmPassword){
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
}

Register = reduxForm({
    form: 'login',
    validate
})(Register);

function mapStateToProps(state){
    return {
        authError: state.user.error
    }
}

export default connect(mapStateToProps, { register, clearAuthError })(Register);
