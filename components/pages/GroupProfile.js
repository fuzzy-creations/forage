import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/Auth.context';
import { DateTimeContext } from '../../contexts/DateTime.context';
import EventCreate from '../auth/EventCreate';
import GroupUpcoming from '../subpages/Group/GroupUpcoming';
import GroupHistory from '../subpages/Group/GroupHistory';
import GroupMembers from '../subpages/Group/GroupMembers';

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
    
    const { user } = useContext(AuthContext);
    const { localDateTime, utcToLocal, dateAfter, dateBefore } = useContext(DateTimeContext);

    const [selectPage, setSelectPage] = useState("page");
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);

    const [access, setAccess] = useState(true);
 

    console.log(props)

    useEffect(() => {
        if(!props.hash && selectPage !== "page" || props.hash !== `#${selectPage}`){
            switch(props.hash){
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
    }, [props.hash])
    
    const optionArray = [{name: "Profile", url: <Link to={`/groups/${props.params}`}><HomeOutlinedIcon /></Link>, mobUrl: <Link to={`/groups/${props.params}`}>Profile</Link>, tag: ""}, 
                        {name: "Upcoming", url: <Link to={`/groups/${props.params}#upcoming`}><CalendarTodayIcon /></Link>, mobUrl: <Link to={`/groups/${props.params}#upcoming`}>Upcoming</Link>, tag: "#upcoming"},
                        {name: "History", url: <Link to={`/groups/${props.params}#history`}><HistoryIcon /></Link>, mobUrl: <Link to={`/groups/${props.params}#history`}>History</Link>, tag: "#history"},
                        {name: "Members", url: <Link to={`/groups/${props.params}#members`}><PeopleAltOutlinedIcon /></Link>, mobUrl:<Link to={`/groups/${props.params}#members`}>Members</Link>, tag: "#members"}]


    useEffect(() => {
        setMenuOptions(optionArray);
        if(props.adminAccess || props.modAccess){
            setMenuSettings("group")
        } else {
            setMenuSettings(null)
        };
    }, [props.adminAccess, props.modAccess, props.params])



        var btnOptions;
        if(props.adminAccess || props.modAccess){
                btnOptions = <span className={styles.adminCreate} onClick={() => props.history.push(`/group/${props.params}/create`)}>Create event</span>
            } else if(!user){
                btnOptions = <span>Join</span>
            } else {
                btnOptions = <GroupActionText groupId={props.params} groupName={props.groupData.name} userId={user} />
            }     

        var eventsMap = props.groupsEvents.map((event, index) => {
            if(props.memberAccess || event.data.outreach === "public"){
                return <EventPreview event={event} key={index} />
            } else {
                return <EventPrivatePreview event={event} key={index} />
            }
        }).slice(0, 3);

       var profpage = (
                <>
                <div className={styles.banner}>
                    <div className={styles.banner__logo}><a href={props.groupData.logo}><img src={props.groupData.logo} /> </a></div>
                    <div className={styles.banner__name}>{props.groupData.name}</div>
                    <div className={styles.banner__button}>{btnOptions}</div>
                    <div className={styles.banner__type}>{props.groupData.type}</div>
                    <div className={styles.banner__location}><span><MdLocationOn /></span>London</div>
                    <div className={styles.banner__about}>{props.groupData.about}</div>
                    <div className={styles.banner__details}>
                        <div>{props.groupsEvents ? props.allEvents.length : 0} Hosted</div>
                        <div className={styles.banner__details__upcoming}>{props.groupsEvents ? props.groupsEvents.length : 0} Upcoming</div>
                        <div> {props.membersList ? props.membersList.length : 0} Members </div>
                    </div>
                </div>   
                <div className={styles.banner__divider}> <hr /> </div>
                <div className={styles.events__grid}>
                    {eventsMap}
                </div>
                <div className={styles.events__view} onClick={() => props.history.push(`#upcoming`)}>View All ></div>
                </>       
            )
    
            var selectedPage;
            if(selectPage === "page"){
                selectedPage = profpage;
            } else if(selectPage === "create"){
                selectedPage = <EventCreate groupId={props.params} />
            } else if (selectPage === "upcoming") {
                selectedPage = <GroupUpcoming events={props.groupsEvents} access={access} memberAccess={props.memberAccess} />
            } else if (selectPage === "history") {
                selectedPage = <GroupHistory events={props.allEvents.filter(event => dateBefore(event.data.date))} access={access} memberAccess={props.memberAccess} />
            } else if (selectPage === "members") {
                selectedPage = <GroupMembers type="group" id={props.params} access={access} members={props.membersList} creatorId={props.groupData.creatorInfo.id} options={props.adminAccess} />
            } 

    return (
        <div className={styles.container}>
            {selectedPage}
        </div>
    )
}

export default GroupProfile;
