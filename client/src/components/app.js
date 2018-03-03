import 'materialize-css/dist/css/materialize.min.css';
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import auth from '../hoc/auth';
import Home from './home';
import Login from './login';
import Register from './register';
import Landing from './landing';
import NotFound from './404';

const App = () => (
    <div className="container">
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={auth(Login, true, '/landing')} />
            <Route path="/register" component={auth(Register, true, '/landing')} />
            <Route path="/landing" component={auth(Landing)} />
            <Route component={NotFound}/>
        </Switch>
    </div>
);

export default App;
