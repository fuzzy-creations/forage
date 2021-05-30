import React, { createContext, useState, useEffect, useContext } from "react";
import { db, getEventMembers, getEventRequests, getUpcoming, findGroupsEvents, getInvites, getRequests, getUserData, getEventData, getGroupData, removeUpcoming, removeInvites, removeEventRequest } from '../firebase/Firebase';
import {AuthContext} from './Auth.context';
import { DateTimeContext } from "./DateTime.context";

export const ProfileDataContext = createContext();

export function ProfileDataProvider(props) {
    const { user, userAdmin, userMods } = useContext(AuthContext)
    const { dateAfter } = useContext(DateTimeContext);
    const [notifications, setNotifications] = useState([]);
    const [upcomingData, setUpcomingData] = useState([]);
    const [inviteData, setInviteData] = useState([]);
    const [requestGroupData, setRequestGroupData] = useState([]);
    const [requestEventData, setRequestEventData] = useState([]);
    const [notesNum, setNotesNum] = useState(0)

    useEffect(() => {
        async function fetchData(){
            db.collection("users").doc(user).collection("notifications").onSnapshot(async (querySnapshot) => {
                const data = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const noteId = doc.id;
                    const note = doc.data();
                 
                    if(note.type === "comment"){
                        return {...note, noteId: noteId};

                    } else if(note.type === "upcoming"){
                        const eventData = await getEventData(note.id)
                        return {...note, eventImage: eventData.image, eventName: eventData.name, noteId: noteId}
                        
                    } else if(note.type === "invite"){
                        return {...note, noteId: noteId};
                    } else if(note.type === "request"){
                        const userData = await getUserData(note.userId);
                        return {
                            ...note,
                            noteId: noteId,
                            userName: userData.firstname,
                            userAvatar: userData.avatar                   
                        }
                    }
                }));
                console.log(data)
                setNotesNum(checkUnreadHandler(data))
                setNotifications(data)
            });


            db.collection("users").doc(user).collection("upcoming").onSnapshot(async (querySnapshot) => {
                const data = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const docData = doc.data()
                    var eventData = await getEventData(docData.eventId);
                    return {
                        id: docData.eventId,
                        eventData: eventData,
                        created: docData.created
                    }  
                  }));     
                setUpcomingData(data);             
            });

            db.collection("users").doc(user).collection("invites").onSnapshot(async (querySnapshot) => {
                const data = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const docData = doc.data()
                    var eventData = await getEventData(docData.eventId);
                    return {
                        id: docData.eventId,
                        eventData: eventData,
                        created: docData.created
                    }  
                  }));     
                setInviteData(data);
            });

            if(userAdmin || userMods){
                var groupArray;
                if(userAdmin && userMods){
                    groupArray = [...userAdmin, ...userMods]
                } else if(userAdmin && !userMods){
                    groupArray = userAdmin
                } else if (!userAdmin && userMods){
                    groupArray = userMods
                }
                
                groupArray.forEach(async (group) => {
                    const groupEvents = await findGroupsEvents(group);
                    groupEvents.forEach(event => {
                        console.log(event)
                    
                        db.collection("events").doc(event.id).collection("requests").onSnapshot(async (querySnapshot) => {
                            let changes = querySnapshot.docChanges()
    
                            changes.forEach(async (change) => {
                                if(change.type === "added"){
                                    var docdata = change.doc.data();
                                    const userInfo = await getUserData(docdata.userId);
                                    const reqData = await getEventData(docdata.requestId)
                                    var data = {
                                        userData: userInfo,
                                        reqData: reqData,
                                        reqId: docdata.requestId,
                                        reqType: docdata.requestType,
                                        groupId: group, 
                                        created: docdata.created              
                                    }
                                    setRequestEventData(prevState => [...prevState, data])
                                } else if(change.type === "removed"){
                                    var docdata = change.doc.data();
                                    function filterMode(request){
                                        if((request.userData.id === change.doc.id) && (request.reqId === docdata.requestId)){
                                            return false
                                        } else {
                                            return true
                                        }
                                    }                                  
                                    setRequestEventData(prevState => prevState.filter(request => filterMode(request)));
    
                                }
                            })
                        })
                    })
                });
                
                groupArray.forEach(group => {
                    db.collection("groups").doc(group).collection("requests").onSnapshot(async (querySnapshot) => {
                        let changes = querySnapshot.docChanges()
                        changes.forEach(async (change) => {
                            if(change.type === "added"){
                                var docdata = change.doc.data();
                                const userInfo = await getUserData(docdata.userId);
                                const reqData = await getGroupData(docdata.requestId);
                                var data = {
                                    userData: userInfo,
                                    reqData: reqData,
                                    reqId: docdata.requestId,
                                    reqType: docdata.requestType,
                                    groupId: group, 
                                    created: docdata.created              
                                }
                                setRequestGroupData(prevState => [...prevState, data])           
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


    function checkUnreadHandler(notes){
        return notes.filter(request => request.isRead === false).length
    }


    function resetCount(){
        setNotesNum(0)
    }

    const requestDataConcat = [...requestGroupData, ...requestEventData]

    return (
    <ProfileDataContext.Provider value={{notifications, upcomingData: upcomingData, inviteData: inviteData, requestData: requestDataConcat, notesNum, resetCount}}>
        {props.children}
    </ProfileDataContext.Provider>
    );
}
