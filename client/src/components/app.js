import 'materialize-css/dist/css/materialize.min.css';
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './home';
import Login from './login';
import NotFound from './404';

const App = () => (
    <div className="container">
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route component={NotFound}/>
        </Switch>
    </div>
);

export default App;
