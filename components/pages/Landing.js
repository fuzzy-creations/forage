import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import styles from '../../sass/pages/Landing.module.scss';

import Register from '../auth/Register'
import Login from '../auth/Login';

import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import GroupWorkRoundedIcon from '@material-ui/icons/GroupWorkRounded';
import StarRoundedIcon from '@material-ui/icons/StarRounded';



function Landing(props){   
    const [regForm, setRegForm] = useState(false);
    const [logForm, setLogForm] = useState(false);

    function switchForm(){
        setRegForm(!regForm)
        setLogForm(!logForm)
    }

    var RegisterArea = (
        <>
        <div className={styles.textarea__header}>
            <div className={styles.textarea__header__logo}><img src='/forage-logo-red.png' /></div>
            <div className={styles.textarea__header__first}>Build</div>
            <div className={styles.textarea__header__second}>Communities</div>
        </div>
        <div className={styles.textarea__para}>
            <div><span className={styles.textarea__para__icon}><SearchRoundedIcon /></span> Discover activities and volunteer</div>
            <div><span className={styles.textarea__para__icon}><GroupWorkRoundedIcon /></span> Organise private events</div>
            <div><span className={styles.textarea__para__icon}><StarRoundedIcon /></span> Grow your business</div>
        </div>
        <div className={styles.textarea__action}>
            <button className={styles.textarea__action__btn} onClick={() => setRegForm(true)}>Sign up</button>
            <button className={styles.textarea__action__btn} onClick={() => setLogForm(true)}>Log in</button>
        </div>
    </>
    )

    if(regForm){
        if(props.username){return <Redirect to="/openevents" />}
        RegisterArea = <Register backBtn={setRegForm} switchForm={switchForm} />
    }
    if(logForm){
        if(props.username){return <Redirect to="/openevents" />}
        RegisterArea = <Login backBtn={setLogForm} switchForm={switchForm} />
    }

    return (
        <>
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.textarea}>
                    {RegisterArea}
                </div>
                <div className={styles.imagearea}>
                    <div className={styles.imagearea__image}></div>
                </div>
            </div>         
        </div>
        </>
    )
}

export default Landing;