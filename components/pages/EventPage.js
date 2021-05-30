import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/pages/EventPage.module.scss';
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

    const [access, setAccess] = useState(true);
    const [selectPage, setSelectPage] = useState("page");

    //const props.params = props.match.params.id;
    // const props.hash = props.location.props.hash;


    useEffect(() => {
        if(!props.hash && selectPage !== "page" || props.hash !== `#${selectPage}`){
            switch(props.hash){
                case "#going":
                    setSelectPage("going")
                    break;
                case "#discussion":
                    setSelectPage("discussion")
                    break;
                default:
                    setSelectPage("page")
            }
        }
    }, [props.hash])

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

    const optionArray = 
    [{name: "Profile", url: <Link to={`/events/${props.params}`}><WhatshotIcon /></Link>, mobUrl: <Link to={`/events/${props.params}`}>Profile</Link>, tag: ""}, 
    {name: "Going", url: <Link to={`/events/${props.params}#going`}><GroupIcon /></Link>, mobUrl: <Link to={`/events/${props.params}#going`}>Going</Link>, tag: "#going"},
    {name: "Discussion", url: <Link to={`/events/${props.params}#discussion`}><ChatBubbleIcon /></Link>, mobUrl:<Link to={`/events/${props.params}#discussion`}>Discussion</Link>, tag: "#discussion"}]


    useEffect(() => {
        setMenuOptions(optionArray);
        if((props.eventInfo && userAdmin && userAdmin.includes(props.eventInfo.groupId)) || (props.eventInfo && userMods && userMods.includes(props.eventInfo.groupId))){
            setMenuSettings("event")
        } else {
            setMenuSettings(null)
        };
    }, [props.eventInfo, userAdmin, userMods])
        
        const userDistance = location ? distance(props.eventLocation.latitude, props.eventLocation.longitude, location.latitude, location.longitude).toFixed(1) : null;
        const newDate = props.eventInfo.date.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const formedDate = [newDate[2], months[newDate[1] - 1]]
    
        const formedPara = props.eventInfo.description.split('\n').map((item, key) => <span key={key}>{item}<br/></span>)
 
        
        var memTiles = props.membersList.map((person, index) => {
            if(index > 7){return <span style={{fontSize: "30px"}}>...</span>}
            return <MemberIcon user={person} />
        })

        var actionButton = props.eventExpired ? "This event has finished" : <EventActionButton event={props.eventInfo} userId={user} eventId={props.params} />;

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
                <div className={styles.event__image}><img src={props.eventInfo.image} /></div>
                <div className={styles.event__location}>
                    <LocationOnOutlinedIcon />
                    <a target="_blank" 
                    href={`https://www.google.com/maps/search/?api=1&query=${props.eventInfo.address.postcode}`}>
                    <div>{props.eventInfo.address.name} {props.eventInfo.address.street1}, {props.eventInfo.address.place},  {props.eventInfo.address.district}, {props.eventInfo.address.region}, {props.eventInfo.address.postcode}</div>
                    </a>
                </div>
                <div className={styles.event__info}>
                    <div>{capitalizeFirstLetter(props.eventInfo.outreach)}</div>
                    <div><Link to="#going">{props.eventInfo.slots - props.eventInfo.members.length} Places left</Link></div>
                    <div><Link to="#discussion">{props.comments === undefined ? 0 : props.comments.length} Comments</Link></div>
                    <div className={styles.event__location__icon}>{location ? `${userDistance} miles away` : ""}</div>
                </div>
                <div className={styles.event__button}>
                    {actionButton}
                </div>
                <div className={styles.event__divider}> <hr /> </div>
                <div className={styles.event__details}>
                    <div className={styles.event__header}>Details</div>
                        <div className={styles.event__details__content}>{formedPara}</div>
                    </div>
                    <div className={styles.event__members}>
                        <div className={styles.event__header}>{props.eventInfo.members === undefined ? 0 : props.eventInfo.members.length} Going</div>
                        <div className={styles.event__members__content}>{memTiles}</div>
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
