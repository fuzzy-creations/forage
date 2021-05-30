import React from 'react';

import { Route, Switch } from 'react-router-dom';

import Register from '../auth/Register';
import Login from '../auth/Login';

import CreateGroup from '../auth/GroupCreate';
import EventCreate from '../auth/EventCreate';

import GroupOptions from '../subpages/Settings/Group/GroupOptions';
import EventOptions from '../subpages/Settings/Event/EventOptions';
import Options from '../subpages/Settings/Account/Options';

function SubForage(){

    return (
        <>
        <Switch>  
            <Route exact path="/register" component={Register} />
            <Route exact path="/signin" component={Login} /> 
            <Route path="/group/:id/create" render={(props) => <EventCreate {...props} />} />
            <Route path="/groupcreate" render={(props) => <CreateGroup {...props} />} />
            <Route path="/accounts/:option" component={Options} />
            <Route path="/group/:id/:option" component={GroupOptions} />
            <Route path="/event/:id/:option" component={EventOptions} />
            <Route path="/group" component={GroupOptions} />
            <Route path="/event" component={EventOptions} />
        </Switch>   
        </>
    )
}

export default SubForage;