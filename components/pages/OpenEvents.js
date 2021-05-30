import React, { useState, useEffect, useContext } from 'react';
import styles from '../../sass/pages/OpenEvents.module.scss';
import { Link } from 'react-router-dom';
import { db, getEventMembers } from '../../firebase/Firebase';

import { MenuOptionsContext } from '../../contexts/MenuOptions.context';
import { AuthContext } from '../../contexts/Auth.context';
import { DateTimeContext } from '../../contexts/DateTime.context';

import EventPreview from '../subcomponents/EventPreview';
import PhantomEventPreview from '../subcomponents/PhantomEventPreview';

import GridOn from '@material-ui/icons/GridOn';
import GroupWork from '@material-ui/icons/GroupWork';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import SportsVolleyballIcon from '@material-ui/icons/SportsVolleyball';


function PublicEvents(props){
    const { location, distance } = useContext(AuthContext);
    const [allPublicEvents, setAllPublicEvents] = useState([]);
    const [publicEvents, setPublicEvents] = useState([]);
    const { dateAfter, utcToLocal, readableDateTime } = useContext(DateTimeContext);
    const [selectPage, setSelectPage] = useState("all");
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);
    const [radius, setRadius] = useState(25);
    const [loading, setLoading] = useState(true);


    const hash = props.location.hash;


    const optionArray = [
            {name: "All", url: <Link to='/openevents'><RadioButtonUncheckedIcon /></Link>, mobUrl: <Link to='/openevents'>All</Link>, tag: ""}, 
            {name: "Charity", url: <Link to='/openevents#charity'><GroupWork /></Link>, mobUrl: <Link to='/openevents#charity'>Charity</Link>, tag: "#charity"},
            {name: "Casual", url: <Link to='/openevents#casual'><SportsVolleyballIcon /></Link>, mobUrl: <Link to='/openevents#casual'>Casual</Link>, tag: "#casual"},
            {name: "Business", url: <Link to='/openevents#business'><GridOn /></Link>, mobUrl: <Link to='/openevents#business'>Business</Link>, tag: "#business"}
        ]
    
    useEffect(() => {
        setMenuOptions(optionArray);
        setMenuSettings(null)
    }, [])

    useEffect(() => {
        async function fetchData(){
            db.collection("events").onSnapshot(async (querySnapshot) => {
                const data = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const members = await getEventMembers(doc.id);
                    const distance = calculateDistance(doc.data().geo)
                    return {id: doc.id, data: {...doc.data(), members: members, distance: distance}}      
                  }));     
                const liveEvents = data.filter(event => dateAfter(event.data.date));
                const openevents = liveEvents.filter(event => event.data.outreach === "public");

                setPublicEvents(filterEvents(openevents));
                setAllPublicEvents(filterEvents(openevents));
            });
            setLoading(false);
        }
        fetchData();
    }, [])

    useEffect(() => {
        if(!hash && selectPage !== "all" || hash !== `#${selectPage}`){
            switch(hash){
                case "#charity":
                    setSelectPage("charity")
                    break;
                case "#business":
                    setSelectPage("business")
                    break;
                case "#casual":
                    setSelectPage("casual")
                    break;
                default:
                    setSelectPage("all")
            }
        }
    }, [hash])

    useEffect(() => {
        if(selectPage === "all"){
            setPublicEvents(allPublicEvents)
        } else {
            const filteredEvents = filterByType(allPublicEvents);
            setPublicEvents(filteredEvents)
        }
    }, [selectPage])

    function filterByType(events){
        return events.filter(event => event.data.groupType === selectPage);   
    }


    function filterEvents(events){
        var upComingEvents = events.filter(event => {
            //event.data.date = utcToLocal(event.data.date)
            return dateAfter(event.data.date)
        })
        return upComingEvents
    }

    function calculateDistance(eventGeo){
        if(location){
            const kms = distance(location.latitude, location.longitude, eventGeo.lat, eventGeo.lng);
            return kms.toFixed(0)
        } else {
            return null
        }
    }

    function filterByRadius(miles){
        const filtered = allPublicEvents.filter(event => Number(event.data.distance) <= miles)
        setPublicEvents(filtered)
    }

    function sortByDate(events){
        return events.sort((a, b) => {
            var arrA = a.data.date.split("-")
            var arrB = b.data.date.split("-")
            if(arrA[0] > arrB[0]){return 1
            } else if (arrB[0] > arrA[0]){return -1
            } else if (arrA[1] > arrB[1]){return 1
            } else if (arrB[1] > arrA[1]){return -1
            } else if (arrA[2] > arrB[2]){return 1
            } else if (arrB[2] > arrA[2]){return -1
            } else {return 0}  
        })
    }


    var eventMap =  [1, 2, 3, 4, 5].map(() => <PhantomEventPreview />)
    if(!loading){eventMap = sortByDate(publicEvents).map(event => <EventPreview event={event} />)}



    ///////////////////////////////////////////////////////////////////////////////

    
    function textQueryHandler(e){
        const query = allPublicEvents.filter(event => {
            const queryText = e.target.value.toLowerCase()
            const lowerName = event.data.name.toLowerCase();
            const lowerGroupName = event.data.groupName.toLowerCase();
            const lowerPlace = event.data.address.place.toLowerCase();
            const lowerRegion = event.data.address.region.toLowerCase();
            const lowerDistrict = event.data.address.district.toLowerCase();
            return lowerName.includes(queryText) || lowerGroupName.includes(queryText) || lowerPlace.includes(queryText) ;       
        })
        setPublicEvents(query);
    }

    var typeHeader = selectPage.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

    ////////////////////////////////////////////////////////////////////////////////

    const [whenSelect, setWhenSelect] = useState('all');
    
    var currentDate = readableDateTime().date.split("-");

    function filterByDate(date){
        setWhenSelect(date) 
        if(date === "all"){
            setPublicEvents(allPublicEvents)
            return;
        }
        var filteredEvents;
        if(date === "today"){filteredEvents = allPublicEvents.filter(event => event.data.date.split("-")[2] === currentDate[2]);} 
        if(date === "tomorrow"){filteredEvents = allPublicEvents.filter(event => event.data.date.split("-")[2] === currentDate[2] + 1);} 
        if(date === "month"){filteredEvents = allPublicEvents.filter(event => event.data.date.split("-")[1] === currentDate[1]);} 
        setPublicEvents(filteredEvents)
    }

    return (
        <div className={styles.container}>
            <div className={styles.boxWrapper}>
                <div className={styles.query}>
                    <input className={styles.query__input} type="text" placeholder="Search" onChange={(e) => textQueryHandler(e)} />
                </div>
                <div className={styles.radius}>
                    <label className={styles.radius__label}>Search Radius</label>
                    <input className={styles.radius__input} type="range" name="slots" min="1" max="50" value={radius} 
                    // onBlur={(e) => filterByRadius(e.target.value)} 
                    onChange={(e) => {
                        setRadius(e.target.value)
                        filterByRadius(e.target.value)
                        }} />
                    <div className={styles.radius__label}>{radius} miles</div>
                </div>
                <div className={styles.selectbtns}>
                    <button onClick={() => filterByDate("today")} className={`${styles.selectbtns__btn} ${whenSelect == "today" ? styles.selectbtns__btn__active : null}`}>Today</button>
                    <button onClick={() => filterByDate("tomorrow")} className={`${styles.selectbtns__btn} ${whenSelect == "tomorrow" ? styles.selectbtns__btn__active : null}`}>Tomorrow</button>
                    <button onClick={() => filterByDate("month")} className={`${styles.selectbtns__btn} ${whenSelect == "month" ? styles.selectbtns__btn__active : null}`}>This month</button>
                    <button onClick={() => filterByDate("all")} className={`${styles.selectbtns__btn} ${whenSelect == "all" ? styles.selectbtns__btn__active : null}`}>All</button>
                </div>
            </div>
            <div className={styles.container__header}>
                Open Events - {typeHeader}
            </div>
            <div className={styles.eventsWrapper}>
                {eventMap}
            </div>
        </div>
    )
}

export default PublicEvents;