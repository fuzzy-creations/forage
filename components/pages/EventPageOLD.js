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
    const { utcToLocal, dateAfter } = useContext(DateTimeContext);
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);

    const [eventInfo, setEventInfo] = useState();
    const [access, setAccess] = useState();
    const [selectPage, setSelectPage] = useState("page");
    const [membersList, setMembersList] = useState(false);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [eventError, setEventError] = useState(false);
    const [eventExpired, setEventExpired] = useState(false);
    const [eventLocation, setEventLocation] = useState();

    const params = props.match.params.id;
    const hash = props.location.hash;


    useEffect(() => {
        async function fetchData(){
            var eventData = await getEventData(params);
            if(eventData.id){

                eventData.date = utcToLocal(eventData.date)
                setEventInfo(eventData);
                if(!dateAfter(eventData.date)){setEventExpired(true)}

                var groupMembers = await getGroupMembers(eventData.groupId);
     
                const groupMemberStatus = () => groupMembers.some(member => member === user);
                const eventMemberStatus = () => eventData.members.some(member => member === user);
                const publicStatus = eventData.outreach === "public" ? true : false; 

                if( publicStatus || eventMemberStatus() || groupMemberStatus() ){ setAccess(true) }

            
                var getMembersListFormat = await Promise.all(eventData.members.map(async (user) => {
                    var userInfo = await getUserData(user)
                    return {id: userInfo.id, firstname: userInfo.firstname, location: userInfo.location, avatar: userInfo.avatar};
                }))
                setMembersList(getMembersListFormat);
    
                var addressToString = `${eventData.address.name}, ${eventData.address.street1} ${eventData.address.street2}, ${eventData.address.county}, ${eventData.address.postcode}`;       
                var code = await straightGeocoder(addressToString)
                setEventLocation(code)

                const memberComments = await getEventComments(params)
                setComments(memberComments);

            }
            setLoading(false);        
        }
        fetchData()
    }, [params, user])

    useEffect(() => {
        if(!hash && selectPage !== "page" || hash !== `#${selectPage}`){
            switch(hash){
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
    }, [hash])

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

    const optionArray = 
    [{name: "Profile", url: <Link to={`/events/${params}`}><WhatshotIcon /></Link>, mobUrl: <Link to={`/events/${params}`}>Profile</Link>, tag: ""}, 
    {name: "Going", url: <Link to={`/events/${params}#going`}><GroupIcon /></Link>, mobUrl: <Link to={`/events/${params}#going`}>Going</Link>, tag: "#going"},
    {name: "Discussion", url: <Link to={`/events/${params}#discussion`}><ChatBubbleIcon /></Link>, mobUrl:<Link to={`/events/${params}#discussion`}>Discussion</Link>, tag: "#discussion"}]


    useEffect(() => {
        setMenuOptions(optionArray);
        if((eventInfo && userAdmin && userAdmin.includes(eventInfo.groupId)) || (eventInfo && userMods && userMods.includes(eventInfo.groupId))){
            setMenuSettings("event")
        } else {
            setMenuSettings(null)
        };
    }, [eventInfo, userAdmin, userMods])

    var selectedPage = eventError ? <h2>Event not found</h2> : <Loader />;
    // event error or event expired 
    
    if(!loading && eventInfo){

        // ACCESS
        const adminAccess = (userAdmin && userAdmin.includes(eventInfo.groupId)) || (userMods && userMods.includes(eventInfo.groupId));
        const commands = access ? <EventActionButton event={eventInfo} userId={user} eventId={params} /> : null;
        if(adminAccess && access !== true){setAccess(true)}
        
        
        // var dt = eventInfo.date.replace("-", ", ")
        // const date = new Date(dt);
        // var month = date.toLocaleString('default', { month: 'short' });
        
        //FORMATTING 
        const userDistance = location ? distance(eventLocation.latitude, eventLocation.longitude, location.latitude, location.longitude).toFixed(1) : null;
        const newDate = eventInfo.date.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const formedDate = [newDate[2], months[newDate[1] - 1]]

        
        const formedPara = eventInfo.description.split('\n').map((item, key) => <span key={key}>{item}<br/></span>)

        var formedAddress = () => {         
            if(access){
                return <div className={styles.event__location}>
                    <LocationOnOutlinedIcon />
                    <a target="_blank" 
                    href={`https://www.google.com/maps/search/?api=1&query=${eventInfo.address.postcode}`}>
                    <div>{eventInfo.address.name}, {eventInfo.address.street1}, {eventInfo.address.place},  {eventInfo.address.district}, {eventInfo.address.region}, {eventInfo.address.postcode}</div>
                    </a>
                    </div>
            } else {
                return <div className={styles.event__location}>
                    <Tooltip title={<span style={{fontSize: "1rem"}}>Only members see the full address</span>}>
                        <InfoOutlinedIcon />          
                    </Tooltip>  
                    <a target="_blank" 
                    href={`https://www.google.com/maps/search/?api=1&query=${eventInfo.address.place}+${eventInfo.address.region}`}>
                    <div>{eventInfo.address.place ? `${eventInfo.address.place}, ` : null} {eventInfo.address.region}</div>
                    </a>
                    </div>
            }
        }
        
        var memTiles = membersList.map((person, index) => {
            if(index > 7){return <span style={{fontSize: "30px"}}>...</span>}
            return <MemberIcon user={person} />
        })

        var postdivider = access ? (
        <>
        <div className={styles.event__details}>
            <div className={styles.event__header}>Details</div>
            <div className={styles.event__details__content}>{formedPara}</div>
        </div>
        <div className={styles.event__members}>
            <div className={styles.event__header}>{eventInfo.members === undefined ? 0 : eventInfo.members.length} Going</div>
            <div className={styles.event__members__content}>{memTiles}</div>
        </div>
        </>
        ) : <h2 className={styles.event__private}>This event is Private</h2>;
        

            const profpage = (
                <>
                <div className={styles.event}>
                    <div className={styles.event__when}>
                        <div className={styles.event__when__date}>{formedDate[0]}</div>
                        <div className={styles.event__when__month}>{formedDate[1]}</div>
                        <div className={styles.event__when__divider}></div>
                        <div className={styles.event__when__time}>{eventInfo.time}</div>
                    </div>
                    <div className={styles.event__name}>{eventInfo.name}</div>
                    <div className={styles.event__groupname}>By <Link to={`/groups/${eventInfo.groupId}`}>{eventInfo.groupName}</Link></div>
                    <div className={styles.event__image}><img src={eventInfo.image} /></div>
                    {formedAddress()}
                    <div className={styles.event__info}>
                        <div>{capitalizeFirstLetter(eventInfo.outreach)}</div>
                        <div><Link to="#going">{eventInfo.slots - eventInfo.members.length} Places left</Link></div>
                        <div><Link to="#discussion">{comments === undefined ? 0 : comments.length} Comments</Link></div>
                        <div className={styles.event__location__icon}>{location ? `${userDistance} miles away` : ""}</div>
                    </div>
                    <div className={styles.event__button}>{commands}</div>
                    <div className={styles.event__divider}> <hr /> </div>
                    {postdivider}
                </div>   
                </>
            )


            if(selectPage === "page"){
                selectedPage = profpage;
            } else if(selectPage === "going"){
                selectedPage = <EventMembers type="event" access={access} id={params} members={membersList} creatorId={eventInfo.creatorId} options={adminAccess ? true : null} />
            } else if (selectPage === "discussion") {
                selectedPage = <EventDiscussion access={access} userId={user} eventId={params} eventName={eventInfo.name} creatorId={eventInfo.creatorId} comments={comments} options={adminAccess ? true : null} />
        }

    } 

        return (
            <div className={styles.container}>
                {selectedPage}
            </div>
        )

}

export default EventPage;
