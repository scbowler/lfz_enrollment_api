import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logout, test } from '../actions';

class Landing extends Component {
    render(){
        return (
            <div>
                <div>
                    <button onClick={this.props.logout} className="btn blue-grey darken-1">Logout</button>
                </div>
                <h1>Landing Page</h1>
                <button onClick={this.props.test}>Test Route</button>
            </div>
        )
    }
}

export default connect(null, { logout, test })(Landing);
