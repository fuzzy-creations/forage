import React, { useContext, useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import useInputState from '../../hooks/useInputState';
import { AuthContext } from '../../contexts/Auth.context';
import styles from '../../sass/auth/Register.module.scss';
import FormLoader from '../UI/FormLoader';
import styles_btn from '../../sass/_buttons.module.scss';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';

import TextField from '@material-ui/core/TextField';

function Login(props){
    const [userInfo, setUserInfo, reset] = useInputState("");
    const { user, loginUser, username } = useContext(AuthContext);
    const [error, setError] = useState();
    const [loader, setLoader] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const login = e => {
        if(e){e.preventDefault()}
        setLoader(true)
        loginUser(userInfo).then(res => {
            if(res === true){
                setLoader(false);
                setRedirect(true);
            } else {
                setLoader(false);
                setError(res);
            }
        });
    }

    if(username || redirect){
        return <Redirect to="/openevents" />
    }

    if(user && !username){
        return <Redirect to="/register" />
    }
    
  var switchbutton = props.switchForm ? <a onClick={() => props.switchForm()}>Register instead</a> : <Link to="/register">Register instead</Link>;

    var buttons = (
        <>
        {props.backBtn ? <button type="button"  className={`${styles_btn.btn__back}`} onClick={() => props.backBtn(false)}><ArrowBackRoundedIcon /></button> : <div></div>}
        <button type="submit" className={`${styles_btn.btn__cont} ${styles_btn.btn__active}`} onClick={() => setError(null)}><p>Enter </p><ArrowForwardRoundedIcon /></button>
        </>
    )
    if(loader){buttons = <FormLoader />}

    return (
        <div className={styles.form}>
            <div className={styles.form__wrapper}>
                <div className={styles.form__header}>
                    <div className={styles.form__header__logo}><Link to="/"><img src='/forage-logo-red.png' /></Link></div>
                    <h1 className={styles.form__header__title}>Login</h1>
                </div>
                <form className={styles.form__group} onSubmit={login}>
                    <TextField className={styles.form__input} name="email" type="text" label="E-mail" onChange={setUserInfo} variant="outlined" />
                    <TextField className={styles.form__input} name="password" type="password" label="Password" onChange={setUserInfo} variant="outlined" />
                    {error}
                    <div className={styles.form__btngroup}>
                        {buttons}
                    </div>
                </form>
            <div className={styles.form__switch}>
                {switchbutton}
            </div>
            </div>
        </div>
    )
}

export default Login;