import React, { useContext, useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/Auth.context';
import styles from '../../sass/auth/Register.module.scss';
import UserReg from './RegUserInfo';
import TextField from '@material-ui/core/TextField';
import FormLoader from '../UI/FormLoader';
import styles_btn from '../../sass/_buttons.module.scss';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';


function Register(props){
    const [userInfo, setUserInfo] = useState({});
    const [password2, setPassword2] = useState();
    const [PWConfirm, setPWConfirm] = useState(false);
    const {user, username, registerUser} = useContext(AuthContext);
    const [userRegStatus, setUserRegStatus] = useState(false);
    const [error, setError] = useState();
    const [loader, setLoader] = useState(false);

    function register(e){
        setLoader(true)
        setUserRegStatus(true);
        registerUser(userInfo).then(res => {
            if(res === true){
                setLoader(false);
                setUserRegStatus(true);
            } else {
                setLoader(false);
                setError(res);
            }
        });
    }


    if(username){return <Redirect to="/openevents" />}
    if(user && userRegStatus === false){setUserRegStatus(true)}


    if(PWConfirm === false && password2 && password2 === userInfo.password){
        setPWConfirm(true) 
        setError("");}
    if(PWConfirm === true && password2 && password2 != userInfo.password){
        console.log("password not mmatych")
        setPWConfirm(false)
        setError("Passwords do not match");
    }

    function inputHandler(e){
        setUserInfo({...userInfo, [e.target.name]: e.target.value})
    }

    function password2Handler(e){
        setPassword2(e.target.value)
    }

    function completeFormHandler(e){
        e.preventDefault()
        if(PWConfirm === false){
            setError("Please complete the form");
        } else {
            setError(null)
            register()
        }
    }


    var buttons = (
        <>
        {props.backBtn ? <button type="button" className={`${styles_btn.btn__back}`} onClick={() => props.backBtn(false)}><ArrowBackRoundedIcon /></button> : <div></div>}
        <button type="submit" className={`${styles_btn.btn__cont} ${PWConfirm === false ? styles_btn.btn__inactive : styles_btn.btn__active}`} onClick={(e) => completeFormHandler(e)}><p>Continue </p><ArrowForwardRoundedIcon /></button>
        </>
    )

    if(loader){buttons = <FormLoader />}


    var page;
    if (user && userRegStatus === true) {
        page = <UserReg {...props} />
    } else {
        page = (
            <>  
            <div className={styles.form__header}>
                <div className={styles.form__header__logo}><Link to="/"><img src='/forage-logo-red.png' /></Link></div>
                <h1 className={styles.form__header__title}>Create your account</h1>
            </div>
            <form className={styles.form__group}>
                <TextField className={styles.form__input} name="email" type="text" label="E-mail" onChange={(e) => inputHandler(e)} variant="outlined" />
                <TextField className={styles.form__input} name="password" type="password" label="Password" onChange={(e) => inputHandler(e)} variant="outlined" />
                <TextField className={styles.form__input} name="password2" type="password" label="Confirm Password" onChange={(e) => password2Handler(e)} onBlur={() => setPWConfirm(true)} variant="outlined" />
                {error}
                <div className={styles.form__btngroup}>
                    {buttons}
                </div>
            </form>
            <div className={styles.form__switch}>
                {props.switchForm ? <a onClick={() => props.switchForm()}>Login Instead</a> : <Link to="/login">Login Instead</Link>}
            </div>
            </>
        )
    }
  

    return (
        <div className={styles.form}>
            {page}
        </div>      
    )
}

export default Register;

