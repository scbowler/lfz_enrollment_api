import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import { renderInput } from '../helpers';
import { login, clearAuthError } from '../actions';

class Login extends Component {

    handleSignIn(vals){
        this.props.login(vals);
    }

    componentWillUnmount(){
        this.props.clearAuthError();
    }

    render(){
        const linkStyle = {
            marginRight: '8px'
        }
        const { handleSubmit, authError } = this.props;
 
        return (
            <div>
                <h1 className="center-align">Login</h1>
                <div className="row">
                    <div className="col s6 offset-s3">
                        <div className="card grey lighten-3">
                            <div className="card-content">
                                <form onSubmit={handleSubmit(this.handleSignIn.bind(this))}>
                                    <Field component={renderInput} name="email" placeholder="Enter your email" />
                                    <Field component={renderInput} name="password" placeholder="Enter your password" type="password" />
                                    <div className="right-align">
                                        <Link style={linkStyle} className="blue-grey-text text-darken-1" to="/">Cancel</Link>
                                        <button className="btn blue-grey darken-1">Sign In</button>
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

Login = reduxForm({
    form: 'login'
})(Login);

function mapStateToProps(state){
    return {
        authError: state.user.error
    }
}

export default connect(mapStateToProps, { login, clearAuthError })(Login);
