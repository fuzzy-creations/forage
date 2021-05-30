import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Layout from './root/Layout';
import SubLayout from './root/SubLayout';
import Landing from './pages/Landing';
import Login from './auth/Login';
import Register from './auth/Register';
import Error404 from './root/Error404';

import { AuthContext } from '../contexts/Auth.context';
import LoadPage from './UI/LoadPage';
import LogOut from './auth/LogOut';


function Router(){
        const { user, username } = React.useContext(AuthContext);


        var routes = (
            <>             
            <Switch>
                <Route exact path="/" render={(props) => <Landing /> } />
                <Route render={() => <LoadPage /> } />
            </Switch>
            </>
        )         
        

        if(user || user === null){
            routes = (
                <> 
                
            <Switch>
                <Route exact path="/" render={(props) => <Landing username={username} /> } />
                <Route exact path="/login" render={(props) => <Login /> } /> 
                <Route exact path="/register" render={(props) => <Register /> } /> 
                <Route exact path="/logout" render={(props) => <LogOut /> } /> 

                <Route path="/loadpage" render={(props) => <LoadPage /> } />
                
                <Route exact path="/group/:id/create" render={(props) => <SubLayout user={user} /> } />
                <Route exact path="/groupcreate" render={(props) => <SubLayout user={user} /> } />
                <Route exact path="/accounts/:option" render={(props) => <SubLayout user={user} /> } /> 
                <Route exact path="/group/:id/:option" render={(props) => <SubLayout user={user} /> } />
                <Route exact path="/event/:id/:option" render={(props) => <SubLayout user={user} /> } />
                <Route exact path="/group" render={(props) => <SubLayout user={user} /> } />
                <Route exact path="/event" render={(props) => <SubLayout user={user} /> } />
        
                <Route exact path="/profile/:id" render={(props) => <Layout user={user} username={username} /> } />
                
                <Route exact path="/openevents" render={(props) => <Layout user={user} username={username} /> } />
                <Route exact path="/myprofile" render={(props) => <Layout user={user} username={username} /> } />
                <Route exact path="/groups" render={(props) => <Layout user={user} username={username} /> } />
                <Route exact path="/users" render={(props) => <Layout user={user} username={username} /> } />
                <Route exact path="/groups/:id" render={(props) => <Layout user={user} username={username} /> } />
                <Route exact path="/events/:id" render={(props) => <Layout user={user} username={username} /> } />
                
                <Route exact path="/testpage" render={(props) => <Layout user={user} username={username} /> } />
                
                <Route render={() => <Error404 /> } />

            </Switch>
            </>
            )
        }

    return (
        <>
        <BrowserRouter>
            {routes}
        </BrowserRouter>
       </>
    )

}

export default Router;