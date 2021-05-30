import React, {useState, useContext, useEffect, memo} from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/subcomponents/NoteIcon.module.scss';
import { readNotes, getEventData, getUserData } from '../../firebase/Firebase';
import { AuthContext } from '../../contexts/Auth.context';
import { IoIosNotifications } from "react-icons/io";
import Notifications from './Notifications';
import DetectClick from '../../tools/DetectClick';
import { ProfileDataContext } from '../../contexts/ProfileData.context';

import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';


function NoteIcon(props){
    const [notesOpen, setNotesOpen] = useState(false);
    const {user, userAdmin} = useContext(AuthContext);
    const [unreadNotesNum, setUnreadNotesNum] = useState(null)
    const { notifications, resetCount, notesNum } = useContext(ProfileDataContext);

    const fullNotifications = notifications.map(note => {
        if(note.type === "comment"){
            return {
                // userimage, user name, event name, eventID
                timestamp: note.created,
                id: note.noteId,
                content: (
                    <div className={styles.notes}>
                    <span className={styles.notes__img}><img src={note.userAvatar} /></span>
                        <Link to={`/events/${note.eventId}#comments`}>
                        <span className={styles.notes__name}>{note.userName} </span>
                            has left a comment on 
                        <span className={styles.notes__name}> {note.eventName}</span>
                    </Link>
                    </div>
                )
            }
        } else if(note.type === "upcoming"){
            // eventImage, eventName, eventId
            return {
                timestamp: note.created,
                id: note.noteId,
                content: (
                    <div className={styles.notes}>
                    <span className={styles.notes__img}><img src={note.eventImage} /></span>
                        <Link to={`/events/${note.id}`}>
                        <span className={styles.notes__name}>{note.eventName} </span>
                            has accepted your request to join
                    </Link>
                    </div>
                )
            }
        } else if(note.type === "invite"){
            //GroupName, EVentName, eventId, eventimage
            return {
                timestamp: note.created,
                id: note.noteId,
                content: (
                    <div className={styles.notes}>
                    <span className={styles.notes__img}><img src={note.content.eventImage} /></span>
                        <Link to={`/events/${note.id}`}>
                        <span className={styles.notes__name}>{note.content.groupName} </span>
                            has invited you to join
                        <span className={styles.notes__name}> {note.content.eventName}</span>
                    </Link>
                    </div>
                )
            }
        } else if(note.type === "request"){
             // userImage, noteName, userId, type
            return {
                timestamp: note.created,
                id: note.noteId,
                content: (
                    <div className={styles.notes}>
                        <span className={styles.notes__img}><img src={note.userAvatar} /></span>
                        <Link to={`/users/${note.userId}`}>
                            <span className={styles.notes__name}>{note.userName} </span>
                                has requested to join 
                            <span className={styles.notes__name}> {note.reqName}</span>
                        </Link>
                    </div>
                )
            }
        }
    })

    function noteButtonHandler(){
        if(notesOpen === false){
            if(notesNum > 0){readNotes(user)}
            resetCount()
            setNotesOpen(true)
        } else if(notesOpen === true) {
            setNotesOpen(false)
        }
    }

        var noteButton = ( 
            <div className={styles.noteWrapper}>

                <div className={styles.notesBtn}> 
                <Tooltip title={<div style={{fontSize: "1rem"}}>Notifications</div>}>
                <Badge badgeContent={notesNum} color="secondary">
                    <div className={`${styles.notesBtn__icon}`} onMouseDown={() => noteButtonHandler()}>
                        <IoIosNotifications />      
                    </div>
                </Badge>
                </Tooltip>
                </div>
            </div>
            )

        var notesModal = notesOpen ? <DetectClick close={setNotesOpen}><Notifications notes={fullNotifications} user={user} /></DetectClick> : null;


    return (
        <>
        {noteButton}
        {notesModal}
        </>
    )

}

export default memo(NoteIcon);



