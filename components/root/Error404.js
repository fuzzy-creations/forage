import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/root/Error404.module.scss';

function Error404(){
    return (

        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.container__error}>404</div>
                <div className={styles.container__message}>Lost in the jungle</div>
                <Link className={styles.container__link} to="/openevents">Go Home</Link>
            </div>
        </div>
    )
}

export default Error404;