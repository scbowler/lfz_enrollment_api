import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { saveStudentData, getCourseRoster } from '../actions';
import { renderInput } from '../helpers';
import '../assets/css/add_modal.css';

class AddRow extends Component {
    constructor(props){
        super(props);

        this.state = {
            visible: false
        };
    }

    submitStudent(values){
        const { classDate, formId } = this.props;

        values.class_date = classDate;
        values.formId = formId;

        this.props.saveStudentData(values).then(() => {
            this.props.getCourseRoster(formId, classDate);
            this.setState({ visible: false });
        });
    }

    render(){
        if(!this.props.show){
            return null;
        }
        if(!this.state.visible){
            return (
                <div className="btn-container">
                    <button onClick={() => this.setState({ visible: true })} className="btn blue-grey darken-1">Add Student</button>
                </div>
            )
        }

        const { handleSubmit, classDate, className } = this.props;

        return (
            <div className="add-modal">
                <div className="vert-center">
                    <div className="row">
                        <div className="col s6 offset-s3">
                            <div className="card grey lighten-3">
                                <div className="card-content">
                                    <span className="card-title center">{className} - {classDate}</span>
                                    <form onSubmit={handleSubmit(this.submitStudent.bind(this))}>
                                        <div className="row">
                                            <div className="col s6">
                                                <Field component={renderInput} name="first_name" placeholder="First Name" />
                                            </div>
                                            <div className="col s6">
                                                <Field component={renderInput} name="last_name" placeholder="Last Name" />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col s6">
                                                <Field component={renderInput} name="email" placeholder="Email" />
                                            </div>
                                            <div className="col s6">
                                                <Field component={renderInput} name="phone" placeholder="Phone" />
                                            </div>
                                        </div>
                                        <Field component={renderInput} name="marketing" placeholder="Marketing Info" />
                                        <div className="info">
                                            <p className="my-2 grey-text text-lighten-1"><strong>Sign Up Time:</strong> {new Date().toLocaleString()}</p>
                                        </div>
                                        <div className="right-align">
                                            <button onClick={() => this.setState({visible: false})} type="button" className="btn blue-grey darken-1 mr-2" to="/">Cancel</button>
                                            <button className="btn blue-grey darken-1">Save</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

AddRow = reduxForm({
    form: 'add-form',
    initialValues: {
        first_name: 'Firsttime',
        last_name: 'Lastname',
        email: 'test@test.com',
        phone: '(909) 890-5678',
        marketing: 'Google'
    }
})(AddRow);

export default connect(null, { saveStudentData, getCourseRoster })(AddRow);
