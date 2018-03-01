import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { reduxForm, Field } from 'redux-form';
import { renderInput } from '../helpers';

class Login extends Component {

    handleSignIn(vals){
        console.log('Login Values:', vals);
    }

    render(){
        const linkStyle = {
            marginRight: '8px'
        }
        const { handleSubmit } = this.props;
 
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

export default Login;
