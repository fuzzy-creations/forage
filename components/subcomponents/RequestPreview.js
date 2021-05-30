import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/subcomponents/RequestPreview.module.scss';
import { acceptEventRequest, removeEventRequest, acceptGroupRequest, removeGroupRequest } from '../../firebase/Firebase';

function RequestsList(props){
    const type = props.request.reqType;
    
    async function acceptRequest(){
        if(type === "event"){
            return acceptEventRequest(props.request.reqId, props.request.userData.id)
        } else if(type === "group"){
            return acceptGroupRequest(props.request.reqId, props.request.userData.id)
        }           
    }


    async function declineRequest(){
        if(type === "event"){
            return removeEventRequest(props.request.reqId, props.request.userData.id)
        } else if(type === "group"){
            return removeGroupRequest(props.request.reqId, props.request.userData.id)
        }    
    }
        
    return (
        <div className={styles.requestPreview}>
            <div className={styles.requestPreview__container}>
                <div className={styles.requestPreview__image}><Link to={`/profile/${props.request.userData.id}`}><img src={props.request.userData.avatar} /></Link></div>
                <div className={styles.requestPreview__username}><Link to={`/profile/${props.request.userData.id}`}>{props.request.userData.firstname} {props.request.userData.surname.charAt(0)}.</Link></div>
                <div className={styles.requestPreview__location}>{props.request.userData.location}</div>
                <div className={styles.requestPreview__reqtype}>{props.request.reqType}</div>
                <div className={styles.requestPreview__reqname}>{props.request.reqData.name}</div>
                <button className={`${styles.requestPreview__btn} ${styles.requestPreview__btn__accept}`} onClick={() => acceptRequest()}>Accept</button>
                <button className={`${styles.requestPreview__btn} ${styles.requestPreview__btn__decline}`} onClick={() => declineRequest()}>Decline</button>
            </div>
        </div>
    )
}

export default RequestsList;