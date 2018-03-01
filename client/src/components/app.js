import 'materialize-css/dist/css/materialize.min.css';
import React from 'react';
import { Route } from 'react-router-dom';
import Home from './home';
import Login from './login';

const App = () => (
    <div className="container">
        <Route exact path="/" component={Home}/>
        <Route path="/login" component={Login}/>
    </div>
);

export default App;
