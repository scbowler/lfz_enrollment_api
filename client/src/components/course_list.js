import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getCourseList } from '../actions';
import Course from './course';

class CourseList extends Component {

    componentDidMount(){
        this.props.getCourseList();
    }

    render(){
        const { courseList, error } = this.props;

        const courses = Object.keys(courseList).map((course, index) => {
            return <Course key={index} title={course} dates={courseList[course]}/>
        });

        return (
            <div>
                <h3>Course List</h3>
                <ul className="collection">
                    {courses}
                </ul>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        courseList: state.sheets.courses,
        error: state.sheets.error
    }
}

export default connect(mapStateToProps, { getCourseList })(CourseList);
