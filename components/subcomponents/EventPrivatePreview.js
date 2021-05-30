import React from 'react';
import { Link, Redirect}  from 'react-router-dom';
import styles from '../../sass/subcomponents/EventPrivatePreview.module.scss';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';

function EventPrivatePreview(props){

    var img = props.event.data.image ? props.event.data.image : "https://firebasestorage.googleapis.com/v0/b/forage-212715.appspot.com/o/groups%2Fprehistoric-001-512.png?alt=media&token=391571cb-6a0b-450d-8296-e26477b8cc40";

    console.log(props)
 
    return (
        <div className={styles.container}>
            <div className={styles.sideWrapper}>
                <div className={styles.date}>00</div>
                <div className={styles.month}>PRI</div>
            </div>
            <div className={styles.mainWrapper}>
                <div className={styles.image}></div>
                <div className={styles.eventname}>Private</div>
                <div className={styles.about}>This is a private event</div>
            </div>
        </div>
    )
}

export default EventPrivatePreview;