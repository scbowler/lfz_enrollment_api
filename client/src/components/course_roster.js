import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourseRoster } from '../actions';
import { getClassName } from '../helpers';
import AddModal from './add_modal';
import Attendance from './attendance';
 
class CourseRoster extends Component {

    componentDidMount(){
        const { courseId, rosterId } = this.props.match.params;

        this.props.getCourseRoster(courseId, rosterId);
    }

    buildRosterTable(){
        const { roster, match: { params } } = this.props;
        this.hasData = roster.length > 0;

        if(!this.hasData){
            return <h4>Loading...</h4>;
        }

        const table = {
            thead: [],
            tbody: []
        };

        for(let row = 0; row < roster.length; row++){
            const pos = row ? 'tbody' : 'thead';
            const tableRow = [];
            const rowLength = roster[row].length;
            for(let item = 0; item < rowLength; item++){
                const content = roster[row][item];
                const data = row ? <td key={item}>{item === rowLength - 1 ? <Attendance roster={params} row={row} attended={content}/> : content}</td> : <th key={item}>{content}</th>
                tableRow.push(data);
            }
            table[pos].push(<tr key={row}>{tableRow}</tr>);
        }

        return (
            <table className="striped">
                <thead>
                    {table.thead}
                </thead>
                <tbody>
                    {table.tbody}
                </tbody>
            </table>
        )
    }

    render(){
        const { courseId, rosterId } = this.props.match.params;
        const className = getClassName(courseId);

        return (
            <div>
                <div className="btn-container">
                    <Link to="/landing" className="btn blue-grey darken-1">Go Back</Link>
                </div>
                <div className="center">
                    <h2>{className} Roster</h2>
                    <h5 className="grey-text text-darken-1">{rosterId}</h5>
                </div>
                {this.buildRosterTable()}
                <AddModal formId={courseId} className={className} classDate={rosterId} show={this.hasData}/>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        roster: state.sheets.roster
    };
}

export default connect(mapStateToProps, { getCourseRoster })(CourseRoster);
