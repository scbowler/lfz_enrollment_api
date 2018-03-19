import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { syncCourse } from '../actions';

class Course extends Component {
    constructor(props){
        super(props);

        this.state = {
            syncing: false
        }
    }

    syncCourse(course){
        this.props.syncCourse(course);
        this.setState({
            syncing: true
        });
    }

    componentWillReceiveProps(){
        if(this.state.syncing){
            this.setState({
                syncing: false
            });
        }
    }

    renderDateList(){
        if (this.state.syncing) {
            return <h5 className="grey-text lighten-1">Syncing...</h5>
        }
        const { dates, title } = this.props;
        const linkStyle = {
            display: 'inline-block',
            height: '100%',
            width: '100%'
        }

        const datesList = Object.keys(dates).map((date, index) => {
            if (date !== 'template' && date !== 'data') {
                if (date.indexOf('Sync Course') > -1) {
                    this.needsSync = 'red-text';
                    return (
                        <li key={index} className={`collection-item ${this.needsSync}`}>
                            {date}
                        </li>
                    );
                }
                return (
                        <li key={index} className={`collection-item ${this.needsSync}`}>
                            <Link style={linkStyle} to={`/course/${title}/roster/${date}`}>
                                {date}
                            </Link>
                        </li>
                );
            }
        });

        return (
            <ul className="collection">
                {datesList}
            </ul>
        )
    }

    render(){
        this.needsSync = ''
        const { title } = this.props;
        const dateList = this.renderDateList();

        return (
            <li className="collection-item">
                <div className="row">
                    <div className="col s8">
                        <h5 className={this.needsSync}>{title}:</h5>
                    </div>
                    <div className="col s4 right-align">
                        <button onClick={() => this.syncCourse(title)} className="btn blue-grey darken-1">Sync Course</button>
                    </div>
                </div>
                {dateList}
            </li>
        );
    }
}

export default connect(null, { syncCourse })(Course);
