import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logout } from '../actions';
import CourseList from './course_list';

class Landing extends Component {
    render(){
        const navStyle = {
            padding: '0 8px'
        };

        return (
            <div>
                <nav style={navStyle} className="right-align grey lighten-2">
                    <button onClick={this.props.logout} className="btn blue-grey darken-1">Logout</button>
                </nav>
                <h1 className="center-align">Landing Page</h1>
                <CourseList/>
            </div>
        )
    }
}

export default connect(null, { logout })(Landing);
