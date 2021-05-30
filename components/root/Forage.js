import React from 'react';

import { Route, Switch } from 'react-router-dom';

import OpenEvents from '../pages/OpenEvents';
import Profile from '../pages/Profile';
import Groups from '../pages/Groups';
import GroupProfile from '../pages/GroupProfile';
import GroupPageController from '../subpages/GroupPageController';
import EventPage from '../pages/EventPage';
import EventPageController from '../subpages/EventPageController';
import MyProfile from '../pages/MyProfile';
import Users from '../pages/Users';

import TestPage from '../TestPage';

function Forage(){

    return (
        <>
        <Switch>  
            <Route exact path="/openevents" render={(props) => <OpenEvents {...props} />} />
            <Route exact path="/groups" render={(props) => <Groups {...props} />} />
            <Route exact path="/users" render={(props) => <Users {...props} />} />
            <Route path="/myprofile" render={(props) => <MyProfile {...props} />} />
            <Route path="/profile/:id" render={(props) => <Profile {...props} />} />
            <Route path="/groups/:id" render={(props) => <GroupPageController {...props} />} />
            <Route path="/events/:id" render={(props) => <EventPageController {...props} />} /> 
            <Route path="/testpage" render={(props) => <TestPage {...props} />} /> 
        </Switch>   
        </>
    )
}

export default Forage;