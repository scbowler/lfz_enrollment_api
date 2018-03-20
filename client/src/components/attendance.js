import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateAttended } from '../actions';

class Attendance extends Component {
    constructor(props){
        super(props);

        this.state = {
            updating: false
        }
    }

    update(e){
        const { updateAttended, row, roster } = this.props;

        this.setState({
            updating: true
        });

        updateAttended(e.target.value, row, roster).then(() => {
            this.setState({
                updating: false
            });
        });
    }

    render(){
        if(this.state.updating){
            return <p className="grey-text">Updating...</p>
        }

        const { attended } = this.props;

        const selectStyle = {
            display: 'block'
        }

        return (
            <select onChange={this.update.bind(this)} style={selectStyle} defaultValue={attended}>
                <option value="In-Person">In-Person</option>
                <option value="Virtual">Virtual</option>
                <option value="No">No</option>
            </select>
        );
    }
}

export default connect(null, { updateAttended })(Attendance);
