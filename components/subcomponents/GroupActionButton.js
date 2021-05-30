import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/Auth.context';
import { db, addGroupRequest, removeGroupRequest, removeMember } from '../../firebase/Firebase';

function GroupButtonText(props){
    const { user } = useContext(AuthContext);
    const [requestData, setRequestData] = useState([]);
    const [memberData, setMemberData] = useState([]);
    const [action, setAction] = useState();

    const [userId, setUserId] = useState(props.userId ? props.userId : user)

     useEffect(() => {
        async function fetchData(){
            db.collection("groups").doc(props.groupId).collection("requests").onSnapshot(querySnapshot => {
                const reqs = querySnapshot.docs.map(doc => doc.data());
                var map = reqs.map(request => request.userId);
                console.log(map)
                setRequestData(map)
                });

            db.collection("groups").doc(props.groupId).collection("members").onSnapshot(querySnapshot => {
                const members = querySnapshot.docs.map(doc => doc.data());
                var map = members.map(member => member.userId);
                console.log(map)
                setMemberData(map)
                });
        }
        fetchData()
     }, [])

     useEffect(() => {
        if(checkMember()){
            setAction("Leave")
        } else if(checkRequested()){
            setAction("Requested")
        } else {
            setAction("Join")
        }
    }, [requestData, memberData])

    function checkRequested(){
        return requestData.includes(userId);  

    }

    function checkMember(){
        return memberData.includes(userId);  
    }


    function actionHandler(action){
        switch(action){
            case "Join": 
                addGroupRequest(props.groupId, userId, props.groupName)
                break;
            case "Requested": 
                removeGroupRequest(props.groupId, userId)
                break;
            case "Leave":
                removeMember(props.groupId, userId)
        }
    }



    return (
        <div onClick={() => actionHandler(action)}>{action}</div>
    )

}

export default GroupButtonText;