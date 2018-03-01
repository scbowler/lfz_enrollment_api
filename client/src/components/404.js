import React from 'react';
import { Link } from 'react-router-dom';

export default props => {
    return (
        <div className="center-align four04">
            <h1>404 Page Not Found</h1>
            <h3><Link className="blue-grey-text text-darken-1" to="/">Go Back</Link></h3>
        </div>
    )
}
