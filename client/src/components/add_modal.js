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
            visible: false,
            saving: false
        };
    }

    submitStudent(values, action, form){
        this.setState({
            saving: true
        });

        const { classDate, formId } = this.props;

        values.class_date = classDate;
        values.formId = formId;

        this.props.saveStudentData(values).then(() => {
            this.props.getCourseRoster(formId, classDate);
            this.setState({
                visible: false,
                saving: false
            });
            form.reset();
        });
    }

    cancelForm(reset){
        this.setState({ 
            visible: false,
            saving: false
        });
        reset();
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

        const { saving } = this.state;
        const { handleSubmit, classDate, className, reset } = this.props;

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
                                                <Field component={renderInput} name="first_name" placeholder="First Name" disabled={saving} />
                                            </div>
                                            <div className="col s6">
                                                <Field component={renderInput} name="last_name" placeholder="Last Name" disabled={saving} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col s6">
                                                <Field component={renderInput} name="email" placeholder="Email" disabled={saving} />
                                            </div>
                                            <div className="col s6">
                                                <Field component={renderInput} name="phone" placeholder="Phone" disabled={saving} />
                                            </div>
                                        </div>
                                        <Field component={renderInput} name="marketing" placeholder="Marketing Info" disabled={saving} />
                                        <div className="info">
                                            <p className="my-2 grey-text text-lighten-1"><strong>Sign Up Time:</strong> {new Date().toLocaleString()}</p>
                                        </div>
                                        <div className="right-align">
                                            <button onClick={() => this.cancelForm(reset)} type="button" className="btn blue-grey darken-1 mr-2" to="/">{ saving ? 'Close' : 'Cancel'}</button>
                                            <button className="btn blue-grey darken-1" disabled={saving}>Save</button>
                                            <p className="red-text text-darken-1">{saving ? 'Saving Student...' : ''}</p>
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
    form: 'add-form'
})(AddRow);

export default connect(null, { saveStudentData, getCourseRoster })(AddRow);
