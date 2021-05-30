import React, { useState, useEffect } from 'react';
import styles from '../../../sass/subpages/Event/EventDiscussion.module.scss';
import TextField from '@material-ui/core/TextField';
import { db, addEventComment, getUserData} from '../../../firebase/Firebase';
import Comment from '../../subcomponents/Comment';
import IDGenerator from '../../../tools/IDGenerator';
import styles_btn from '../../../sass/_buttons.module.scss';
import SendRoundedIcon from '@material-ui/icons/SendRounded';

function EventDiscussion(props){
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [userData, setUserData] = useState({});
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function fetchData(){
            const data = await getUserData(props.userId)
            setUserData(data)

            db.collection("events").doc(props.eventId).collection("comments").onSnapshot(async (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => {
                    console.log(doc.data())
                    return doc.data().comment
                })
                setComments(sortComments(data))    
                })
            }
        fetchData()
    }, [props.userId])

    function sortComments(comments){
        return comments.sort((a, b) => {
            return a.created.seconds - b.created.seconds
        }).reverse()
    }

    function submitHandler(e){
        e.preventDefault();
        const commentId = IDGenerator();
        setComment("");

        addEventComment(commentId, props.eventId, userData, comment, props.eventName).then(res => {
            if(res === true){
                setStatus("");
            } else {
                setStatus(res)
                setTimeout(() => {
                    setStatus("")
                }, 3000)
            }
        })
    }

    var commentsMap = comments.map(comment => <Comment data={comment} eventId={props.eventId} user={props.userId} options={props.options} />)

    // var page = props.access ? (
    //     <div className={styles.discussion__container}>
    //         <div className={styles.discussion__map}>{commentsMap}</div>
    //         <form className={styles.discussion__wrapper} onSubmit={(e) => submitHandler(e)}>
    //             <TextField className={styles.discussion__input} value={comment} name="comment" type="text" label="Comment" onChange={(e) => setComment(e.target.value)} variant="outlined" />          
    //             <button type="submit" className={styles_btn.btn__back}><SendRoundedIcon /></button>
    //         </form>
    //         <div className={styles.discussion__status}>{status}</div>
    //     </div>

    // ) : "Private Event"

   
    return (
        <div className={styles.discussion}>
            <h1>Discussion</h1>
            <div className={styles.discussion__container}>
            <div className={styles.discussion__map}>{commentsMap}</div>
            <form className={styles.discussion__wrapper} onSubmit={(e) => submitHandler(e)}>
                <TextField className={styles.discussion__input} value={comment} name="comment" type="text" label="Comment" onChange={(e) => setComment(e.target.value)} variant="outlined" />          
                <button type="submit" className={styles_btn.btn__back}><SendRoundedIcon /></button>
            </form>
            <div className={styles.discussion__status}>{status}</div>
        </div>
           
        </div>
    )
}

export default EventDiscussion;