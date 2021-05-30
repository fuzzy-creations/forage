import React from 'react';
import styles from '../../sass/subcomponents/Notifications.module.scss';
import { deleteNote } from '../../firebase/Firebase';
import { IoIosNotifications } from "react-icons/io";
import moment from 'moment';

function Notifications(props){

    var notificationsMap = (<div className={styles.nonotes}>
        <span className={styles.nonotes__icon}><IoIosNotifications /></span>
        <span className={styles.nonotes__text}>No Notifications</span>
        <span className={styles.nonotes__para}>Join communities to revieve notifications about their latest events</span>   
        </div>)


    var sortedNotes = props.notes.sort((a, b) => {
        return a.timestamp.seconds - b.timestamp.seconds
    }).reverse()


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

    if(props.notes.length > 0){
        notificationsMap = props.notes.map((note) => {
            var time = note.timestamp.seconds * 1000;
            var momtime = moment.duration(moment(parsedDate).diff(moment(time)))
            var timeframe = calculateLength(momtime)
            return (
                <div className={styles.notesContent}>
                    <div className={styles.notesContent__text}>{note.content}</div>
                    <div className={styles.notesContent__time}>{timeframe}</div>
                    <div className={styles.notesContent__delete} onClick={() => deleteNote(props.user, note.id)}>Delete</div>
                </div>
            )
        }).slice(0, 40)
    }


    return (
        <>
        <div className={styles.notesWrapper}>
            <div className={styles.notesContainer}>
                <div className={styles.notesHeader}>Notifications</div>
                <div className={styles.notesList}>
                    {notificationsMap}
                </div>
            </div>
        </div>
        </>
    )
}

export default Notifications;