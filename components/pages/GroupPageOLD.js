import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getGroupData, findGroupsEvents, getUserData } from '../../firebase/Firebase';
import { AuthContext } from '../../contexts/Auth.context';
import { DateTimeContext } from '../../contexts/DateTime.context';
import EventCreate from '../auth/EventCreate';
import GroupUpcoming from '../subpages/Group/GroupUpcoming';
import GroupHistory from '../subpages/Group/GroupHistory';
import GroupMembers from '../subpages/Group/GroupMembers';
import Loader from '../UI/Loader';

import EventPreview from '../subcomponents/EventPreview';
import EventPrivatePreview from '../subcomponents/EventPrivatePreview';

import styles from '../../sass/pages/GroupPage.module.scss';

import GroupActionText from '../subcomponents/GroupActionButton';


import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import PeopleAltOutlinedIcon from '@material-ui/icons/PeopleAltOutlined';
import HistoryIcon from '@material-ui/icons/History';

import { MdLocationOn } from "react-icons/md"

import { MenuOptionsContext } from '../../contexts/MenuOptions.context';

function GroupProfile(props){
    const params = props.match.params.id;
    const { user, userAdmin, userMods } = useContext(AuthContext);
    const { localDateTime, utcToLocal, dateAfter, dateBefore } = useContext(DateTimeContext);
    const [groupData, setGroupData] = useState(null);
    const [groupsEvents, setGroupsEvents] = useState(null);
    const [allEvents, setAllEvents] = useState([]);
    const [membersList, setMembersList] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [loading, setLoading] = useState(true);

    const [eventError, setEventError] = useState(false);

    const [selectPage, setSelectPage] = useState("page");
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);
    const hash = props.location.hash;
    
    useEffect(() => {
        async function fetchData(){
            var groupProfileData = await getGroupData(params);
            if(groupProfileData.id){
                setGroupData(groupProfileData);
                var groupsEventsInfo = await findGroupsEvents(params)
                var groupEventsWithUtcDate = groupsEventsInfo.map((event) => {
                    return {...event, data: {...event.data, date: utcToLocal(event.data.date)}}
                })
                setAllEvents(groupEventsWithUtcDate);

                var upComingEvents = groupsEventsInfo.filter(event => {
                    event.data.date = utcToLocal(event.data.date)
                    return dateAfter(event.data.date)
                })
                
                setGroupsEvents(upComingEvents);
            
                var getMembersListFormat = await Promise.all(groupProfileData.members.map(async (user) => {
                    var userInfo = await getUserData(user.user)
                    return {id: userInfo.id, firstname: userInfo.firstname, location: userInfo.location, avatar: userInfo.avatar, mod: user.mod};
                }))
                setMembersList(getMembersListFormat);
                setLoading(false)
            } else {
                setEventError(true)
            }
        }
        fetchData();
    }, [params])

    useEffect(() => {
        if(!hash && selectPage !== "page" || hash !== `#${selectPage}`){
            switch(hash){
                case "#upcoming":
                    setSelectPage("upcoming")
                    break;
                case "#history":
                    setSelectPage("history")
                    break;
                case "#members":
                    setSelectPage("members")
                    break;
                default:
                    setSelectPage("page")
            }
        }
    }, [hash])
    
    const optionArray = [{name: "Profile", url: <Link to={`/groups/${params}`}><HomeOutlinedIcon /></Link>, mobUrl: <Link to={`/groups/${params}`}>Profile</Link>, tag: ""}, 
                        {name: "Upcoming", url: <Link to={`/groups/${params}#upcoming`}><CalendarTodayIcon /></Link>, mobUrl: <Link to={`/groups/${params}#upcoming`}>Upcoming</Link>, tag: "#upcoming"},
                        {name: "History", url: <Link to={`/groups/${params}#history`}><HistoryIcon /></Link>, mobUrl: <Link to={`/groups/${params}#history`}>History</Link>, tag: "#history"},
                        {name: "Members", url: <Link to={`/groups/${params}#members`}><PeopleAltOutlinedIcon /></Link>, mobUrl:<Link to={`/groups/${params}#members`}>Members</Link>, tag: "#members"}]


    useEffect(() => {
        setMenuOptions(optionArray);
        if(userAdmin && userAdmin.includes(params) || userMods && userMods.includes(params)){
            setMenuSettings("group")
        } else {
            setMenuSettings(null)
        };
    }, [userAdmin, userMods, params])

    if(eventError){return <h2>Group not found</h2> }


    var selectedPage = <Loader />;

    if(!loading){

        var access;
        if(!eventError && userAdmin && userAdmin.includes(params) || groupData.creatorInfo.id == user){
            access = "admin"           
        } else if (!eventError && userMods && userMods.includes(params)){
            access = "mod"       
        } else if (groupData.members.includes(user)){
            access = "member"      
        } else {
            access = false;
        }


        var btnOptions;
        if(access === "admin" || access === "mod"){
                btnOptions = <span className={styles.adminCreate} onClick={() => props.history.push(`/group/${params}/create`)}>Create event</span>
            } else if(!user){
                btnOptions = <span>Join</span>
            } else {
                btnOptions = <GroupActionText groupId={params} groupName={groupData.name} userId={user} />
            }     

            var eventsMap = groupsEvents.map(event => {
                if(access || event.data.outreach === "public"){
                    return <EventPreview event={event} />
                } else {
                    return <EventPrivatePreview event={event} />
                }
            }).slice(0, 3);

       var profpage = (
                <>
                <div className={styles.banner}>
                    <div className={styles.banner__logo}><a href={groupData.logo}><img src={groupData.logo} /> </a></div>
                    <div className={styles.banner__name}>{groupData.name}</div>
                    <div className={styles.banner__button}>{btnOptions}</div>
                    <div className={styles.banner__type}>{groupData.type}</div>
                    <div className={styles.banner__location}><span><MdLocationOn /></span>London</div>
                    <div className={styles.banner__about}>{groupData.about}</div>
                    <div className={styles.banner__details}>
                        <div>{groupsEvents ? allEvents.length : 0} Hosted</div>
                        <div className={styles.banner__details__upcoming}>{groupsEvents ? groupsEvents.length : 0} Upcoming</div>
                        <div> {membersList ? membersList.length : 0} Members </div>
                    </div>
                </div>   
                <div className={styles.banner__divider}> <hr /> </div>
                <div className={styles.events__grid}>
                    {eventsMap}
                </div>
                <div className={styles.events__view} onClick={() => props.history.push(`#upcoming`)}>View All ></div>
                </>       
            )
    
            if(selectPage === "page"){
                selectedPage = profpage;
            } else if(selectPage === "create"){
                selectedPage = <EventCreate groupId={params} />
            } else if (selectPage === "upcoming") {
                selectedPage = <GroupUpcoming events={groupsEvents} access={access} />
            } else if (selectPage === "history") {
                selectedPage = <GroupHistory events={allEvents.filter(event => dateBefore(event.data.date))} access={access} />
            } else if (selectPage === "members") {
                selectedPage = <GroupMembers type="group" id={params} access={access} members={membersList} creatorId={groupData.creatorInfo.id} options={access === "admin" ? true : null} />
            } 
    }

    return (
        <div className={styles.container}>
            {selectedPage}
        </div>
    )
}

export default GroupProfile;
