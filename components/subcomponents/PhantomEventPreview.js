import React from 'react';
import styles from '../../sass/subcomponents/PhantomEventPreview.module.scss';

function PhantomEventPreview(props){

    return (
        <div className={styles.container}>
            <div className={styles.sideWrapper}>
                <div className={styles.date}></div>
                <div className={styles.month}></div>
            </div>
            <div className={styles.mainWrapper}>
                <div className={styles.image}></div>
                <div className={styles.eventname}></div>
                <div className={styles.about}></div>
            </div>
        </div>
    )
}

export default PhantomEventPreview;