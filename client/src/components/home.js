import React from 'react';
import { Link } from 'react-router-dom';

export default props => {
    return <h1>Site status: [<Link to="/login" className="green-text">OK</Link>]</h1>
}
