import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/pages/EventPagePrivate.module.scss';
import { getEventData, getUserData, getGroupMembers, getEventComments } from '../../firebase/Firebase';

import { AuthContext } from '../../contexts/Auth.context';
import { DateTimeContext } from '../../contexts/DateTime.context';
import { MenuOptionsContext } from '../../contexts/MenuOptions.context';

import MemberIcon from '../subcomponents/MemberIcon';
import EventActionButton from '../subcomponents/EventActionButton';
import Loader from '../UI/Loader';
import { straightGeocoder } from '../../tools/Geocoder';

import EventMembers from '../subpages/Event/EventMembers';
import EventDiscussion from '../subpages/Event/EventDiscussion';

import Tooltip from '@material-ui/core/Tooltip';

import WhatshotIcon from '@material-ui/icons/Whatshot';
import GroupIcon from '@material-ui/icons/Group';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

function EventPage(props){
    const { user, userAdmin, userMods, location, distance } = useContext(AuthContext);
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);

    const [access, setAccess] = useState();
    const [selectPage, setSelectPage] = useState("page");

    // useEffect(() => {
    //     if(!props.hash && selectPage !== "page" || props.hash !== `#${selectPage}`){
    //         switch(props.hash){
    //             case "#going":
    //                 setSelectPage("going")
    //                 break;
    //             case "#discussion":
    //                 setSelectPage("discussion")
    //                 break;
    //             default:
    //                 setSelectPage("page")
    //         }
    //     }
    // }, [props.hash])

    const optionArray = 
    [{name: "Profile", url: <Link to={`/events/${props.params}`}><WhatshotIcon /></Link>, mobUrl: <Link to={`/events/${props.params}`}>Profile</Link>, tag: ""}] 

    useEffect(() => {
        setMenuOptions(optionArray);
    }, [props.eventInfo])


    // {name: "Going", url: <Link to={`/events/${props.params}#going`}><GroupIcon /></Link>, mobUrl: <Link to={`/events/${props.params}#going`}>Going</Link>, tag: "#going"},
    // {name: "Discussion", url: <Link to={`/events/${props.params}#discussion`}><ChatBubbleIcon /></Link>, mobUrl:<Link to={`/events/${props.params}#discussion`}>Discussion</Link>, tag: "#discussion"}]

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }  
  
        
        const userDistance = location ? distance(props.eventLocation.latitude, props.eventLocation.longitude, location.latitude, location.longitude).toFixed(1) : null;
        const newDate = props.eventInfo.date.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const formedDate = [newDate[2], months[newDate[1] - 1]]
    
        const formedPara = props.eventInfo.description.split('\n').map((item, key) => <span key={key}>{item}<br/></span>)

        const profpage = (
            <>
            <div className={styles.event}>
                <div className={styles.event__when}>
                    <div className={styles.event__when__date}>{formedDate[0]}</div>
                    <div className={styles.event__when__month}>{formedDate[1]}</div>
                    <div className={styles.event__when__divider}></div>
                    <div className={styles.event__when__time}>{props.eventInfo.time}</div>
                </div>
                <div className={styles.event__name}>{props.eventInfo.name}</div>
                <div className={styles.event__groupname}>By <Link to={`/groups/${props.eventInfo.groupId}`}>{props.eventInfo.groupName}</Link></div>
                <div className={styles.event__location}>
                    <Tooltip title={<span style={{fontSize: "1rem"}}>Only members see the full address</span>}>
                        <InfoOutlinedIcon />          
                    </Tooltip>  
                    <a target="_blank" 
                    href={`https://www.google.com/maps/search/?api=1&query=${props.eventInfo.address.place}+${props.eventInfo.address.region}`}>
                    <div>{props.eventInfo.address.place ? `${props.eventInfo.address.place}, ` : null} {props.eventInfo.address.region}</div>
                    </a>
                </div>
                <div className={styles.event__info}>
                    <div>{capitalizeFirstLetter(props.eventInfo.outreach)}</div>
                    <div>{props.eventInfo.slots - props.eventInfo.members.length} Places left</div>
                    <div>{props.comments === undefined ? 0 : props.comments.length} Comments</div>
                    <div className={styles.event__location__icon}>{location ? `${userDistance} miles away` : ""}</div>
                </div>
                <Link className={styles.event__button} to={`/groups/${props.eventInfo.groupId}`}>
                    View Community
                </Link>
                
                <div className={styles.event__divider}> <hr /> </div>
                <div className={styles.event__private}>
                    <div className={styles.event__private__icon}><InfoOutlinedIcon /></div>
                    <div className={styles.event__private__text}>This event is private</div>
                    <div className={styles.event__private__para}>Join the events community to get access to the event</div>
                </div>
            </div>   
            </>
        )

            var selectedPage;
            if(selectPage === "page"){
                selectedPage = profpage;
            } else if(selectPage === "going"){
                selectedPage = <EventMembers type="event" access={access} id={props.params} members={props.membersList} creatorId={props.eventInfo.creatorId} options={props.adminAccess ? true : null} />
            } else if (selectPage === "discussion") {
                selectedPage = <EventDiscussion access={access} userId={user} eventId={props.params} eventName={props.eventInfo.name} creatorId={props.eventInfo.creatorId} comments={props.comments} options={props.adminAccess ? true : null} />
        }

        return (
            <div className={styles.container}>
                {selectedPage}
            </div>
        )

}

export default EventPage;
