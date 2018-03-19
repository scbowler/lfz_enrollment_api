import React, { Component } from 'react';
import { connect } from 'react-redux';

export default function(WrappedComponent, redirect = false, to = '/'){
    class Auth extends Component {

        componentWillMount(){
            const { auth, history } = this.props;
            
            if (auth && redirect || !auth && !redirect){
                history.push(to);
            }
        }

        componentWillReceiveProps(nextProps){
            const { auth, history } = nextProps;

            if (auth && redirect || !auth && !redirect || !auth && redirect) {
                history.push(to);
            }
        }


        render(){
            return <WrappedComponent {...this.props}/>
        }
    }

    function mapStateToProps(state){
        return {
            auth: state.user.auth
        }
    }

    return connect(mapStateToProps)(Auth);
}
