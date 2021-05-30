import React, { createContext, useState, useEffect, useContext } from "react";
import { db, getEventMembers, getEventRequests, getUpcoming, findGroupsEvents, getInvites, getRequests, getUserData, getEventData, getGroupData, removeUpcoming, removeInvites, removeEventRequest } from '../firebase/Firebase';
import {AuthContext} from './Auth.context';
import { DateTimeContext } from "./DateTime.context";

export const ProfileDataContext = createContext();

export function ProfileDataProvider(props) {
    const {user, userAdmin} = useContext(AuthContext)
    const { dateAfter } = useContext(DateTimeContext);
    const [upcomingData, setUpcomingData] = useState([]);
    const [inviteData, setInviteData] = useState([]);
    const [requestGroupData, setRequestGroupData] = useState([]);
    const [requestEventData, setRequestEventData] = useState([]);
    const [notesNum, setNotesNum] = useState(0)

    useEffect(() => {
        async function fetchData(){
            db.collection("users").doc(user).collection("upcoming").onSnapshot(async (querySnapshot) => {
                const data = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const docData = doc.data()
                    var eventData = await getEventData(docData.eventId);
                    return {
                        id: docData.eventId,
                        eventData: eventData,
                        created: docData.created,
                        isRead: docData.isRead
                    }  
                  }));     
                setUpcomingData(data)
                const unread = checkUnreadHandler(data)
                setNotesNum(count => count + unread);              
            });

            db.collection("users").doc(user).collection("invites").onSnapshot(async (querySnapshot) => {
                const data = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const docData = doc.data()
                    var eventData = await getEventData(docData.eventId);
                    return {
                        id: docData.eventId,
                        eventData: eventData,
                        created: docData.created,
                        isRead: docData.isRead
                    }  
                  }));     
                setInviteData(data)
                const unread = checkUnreadHandler(data)
                setNotesNum(count => count + unread);
            });

            if(userAdmin){
                userAdmin.forEach(async (group) => {
                    const groupEvents = await findGroupsEvents(group);
                    groupEvents.forEach(event => {
                        console.log(event)
                    
                        db.collection("events").doc(event.id).collection("requests").onSnapshot(async (querySnapshot) => {
                            let changes = querySnapshot.docChanges()
                            console.log(changes)
    
                            changes.forEach(async (change) => {
                                if(change.type === "added"){
                                    var docdata = change.doc.data();
                                    console.log(docdata)
                                    const userInfo = await getUserData(docdata.userId);
                                    const reqData = await getEventData(docdata.requestId)
                                    var data = {
                                        userData: userInfo,
                                        reqData: reqData,
                                        reqId: docdata.requestId,
                                        reqType: docdata.requestType,
                                        groupId: group, 
                                        isRead: docdata.isRead, 
                                        created: docdata.created              
                                    }
                                    console.log(data)
                                    setRequestEventData(prevState => [...prevState, data])
                                    if(data.isRead === false){
                                        setNotesNum(count => count + 1);
                                    }             
                                } else if(change.type === "removed"){
                                    var docdata = change.doc.data();
    
                                    function filterMode(request){
                                        if((request.userData.id === change.doc.id) && (request.reqId === docdata.requestId)){
                                            return false
                                        } else {
                                            return true
                                        }
                                    }
                                    
                                    setRequestEventData(prevState => prevState.filter(request => filterMode(request)))
                                    if(docdata.isRead === false){setNotesNum(count => count - 1);}   
    
                                }
                            })
                        })
                    })
                })
                
                userAdmin.forEach(group => {
                    db.collection("groups").doc(group).collection("requests").onSnapshot(async (querySnapshot) => {
                        let changes = querySnapshot.docChanges()
                        console.log(changes)
                        changes.forEach(async (change) => {
                            console.log(change)
                            if(change.type === "added"){
                                var docdata = change.doc.data();
                                console.log(docdata)
                                const userInfo = await getUserData(docdata.userId);
                                const reqData = await getGroupData(docdata.requestId);
                                var data = {
                                    userData: userInfo,
                                    reqData: reqData,
                                    reqId: docdata.requestId,
                                    reqType: docdata.requestType,
                                    groupId: group, 
                                    isRead: docdata.isRead, 
                                    created: docdata.created              
                                }
                                console.log(data)
                                setRequestGroupData(prevState => [...prevState, data])
                                if(data.isRead === false){
                                    setNotesNum(count => count + 1);
                                }             
                            } else if(change.type === "removed"){
                                var docdata = change.doc.data();

                                function filterMode(request){
                                    if((request.userData.id === change.doc.id) && (request.reqId === docdata.requestId)){
                                        return false
                                    } else {
                                        return true
                                    }
                                }
                                
                                setRequestGroupData(prevState => prevState.filter(request => filterMode(request)))
                                if(docdata.isRead === false){setNotesNum(count => count - 1);}   

                            }
                    });
    
                })
           
            })

            }
        }
        if(user){
            fetchData()
        }
    }, [user, userAdmin])

    useEffect(() => {

        [...upcomingData, ...inviteData].forEach(note => {
            if(!dateAfter(note.eventData.date)){
                removeUpcoming(user, note.id)
                removeInvites(user, note.id)
            }
        })
        if(userAdmin){
            requestEventData.forEach(note => {
                if(!dateAfter(note.reqData.date)){
                    removeEventRequest(note.reqId, note.userData.id)
                }
            })
        }
         
    }, [upcomingData, inviteData])

    function deleteExpiredNotes(notes){
        notes.forEach(note => {
            if(!dateAfter(note.eventData.date)){
                removeUpcoming(user, note.id)
                removeInvites(user, note.id)
            }
        })
    }

    function checkUnreadHandler(notes){
        return notes.filter(request => request.isRead === false).length
    }


    function resetCount(){
        setNotesNum(0)
    }

    const requestDataConcat = [...requestGroupData, ...requestEventData]

    //setNotesNum(upcomingData.length + inviteData.length + requestDataConcat.length);

    return (
    <ProfileDataContext.Provider value={{upcomingData: upcomingData, inviteData: inviteData, requestData: requestDataConcat, notesNum, resetCount}}>
        {props.children}
    </ProfileDataContext.Provider>
    );
}
