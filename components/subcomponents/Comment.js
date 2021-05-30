import React from 'react';
import styles from '../../sass/subcomponents/Comment.module.scss';
import { Link } from 'react-router-dom';
import { removeEventComment } from '../../firebase/Firebase';
import moment from 'moment';

function Comment(props){

    function deleteHandler(){
        removeEventComment(props.eventId, props.data.id)
    }

    
    var d = new Date()
    var parsedDate = parseInt(d.getTime())

    function calculateLength(time){
        var when;
        if(Math.floor(time.asDays()) > 0){
            when = "More than a day ago"
        } else if(Math.floor(time.asHours()) > 0){
            when = Math.floor(time.asHours()) + " hours ago"
        } else if(Math.floor(time.asMinutes()) > 0){
            when = Math.floor(time.asMinutes()) + " minutes ago"
        } else {
            when = "Just now"
        }
        return when;
    }

    function calculateTime(){
        var time = props.data.created.seconds * 1000;
        var momtime = moment.duration(moment(parsedDate).diff(moment(time)))
        return calculateLength(momtime)
            
    }


    var deleteOption
    if(props.user === props.data.userData.id || props.options){
        deleteOption = <button onClick={() => deleteHandler()} className={`${styles.comment__delete}`}>Delete</button>
    } else {
        deleteOption = <div></div>;
    }
    return (
        <div className={styles.comment}>
            <div className={styles.comment__avatar}><img src={props.data.userData.avatar} /></div>
            <div className={styles.comment__name}><Link to={`/profile/${props.data.userData.id}`}>{props.data.userData.name}</Link></div>
            <div className={styles.comment__timestamp}>{calculateTime()}</div>
            {deleteOption}
            <div className={styles.comment__content}>{props.data.content}</div>
        </div>
    )

}

export default Comment;