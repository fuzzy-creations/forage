import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/Auth.context';
import { DateTimeContext } from '../../contexts/DateTime.context';
import { db, addEventRequest, removeEventRequest, removeUpcoming, removeEventMember } from '../../firebase/Firebase';

function EventButtonText(props){
    // event ID, userID, joinedList
    const { user } = useContext(AuthContext);
    const { dateAfter } = useContext(DateTimeContext);
    const [requestData, setRequestData] = useState([]);
    const [memberData, setMemberData] = useState([]);
    const [action, setAction] = useState("");

    const [userId, setUserId] = useState(props.userId ? props.userId : user)

     useEffect(() => {
        async function fetchData(){
            db.collection("events").doc(props.eventId).collection("requests").onSnapshot(querySnapshot => {
                const reqs = querySnapshot.docs.map(doc => doc.data());
                var map = reqs.map(request => request.userId);
                setRequestData(map)
                });

            db.collection("events").doc(props.eventId).collection("members").onSnapshot(querySnapshot => {
                const members = querySnapshot.docs.map(doc => doc.data());
                var map = members.map(member => member.user);
                setMemberData(map)
                });
              }
             
        fetchData()
     }, [])


     useEffect(() => {
        if(checkUpcoming()){
            setAction("Leave")
        } else if(checkRequested()){
            setAction("Requested")
        } else {
            setAction("Join")
        }
    }, [requestData, memberData])

     if(!dateAfter(props.event.date)){
         return <div>Event finished</div>
     }


    function checkRequested(){
        return requestData.includes(userId)

    }

    function checkUpcoming(){
       return memberData.includes(userId)
    }

    function actionHandler(action){
        switch(action){
            case "Join": 
                addEventRequest(props.eventId, userId, props.event.groupId, props.event.name)
                break;
            case "Requested": 
                removeEventRequest(props.eventId, userId)
                break;
            case "Leave":
                removeUpcoming(userId, props.eventId)
                removeEventMember(props.eventId, userId)
        }
    }



    return (
        <div onClick={() => actionHandler(action)}>{action}</div>
    )

}

export default EventButtonText;