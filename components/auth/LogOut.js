import React, { useState, useContext, useEffect } from 'react';
import styles from '../../sass/auth/LogOut.module.scss';
import { AuthContext } from '../../contexts/Auth.context';
import { Redirect } from 'react-router';

function LogOut(){
    const { signOut } = useContext(AuthContext);
    const [status, setStatus] = useState(false);
    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        signOut().then(setStatus(true))
    }, [])

    if(redirect){return <Redirect to="/" />}

    if(status){
        setTimeout(() => {
            setRedirect(true)
        }, 3000)    
    }


    return (
            
        <div className={styles.container}>
           { status ? <h1>Sucessfully logged out</h1> : <h1>Logging out...</h1>}
        </div>
    )
}

export default LogOut;