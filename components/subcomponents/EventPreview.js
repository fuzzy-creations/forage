import React from 'react';
import { Link }  from 'react-router-dom';
import styles from '../../sass/subcomponents/EventPreview.module.scss';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';

function EventPreview(props){

    const newDate = props.event.data.date.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const formedDate = [newDate[2], months[newDate[1] - 1]]
    const formattedDetails = props.event.data.description.substring(0, 170) + "...";
    const img = props.event.data.image ? props.event.data.image : "https://firebasestorage.googleapis.com/v0/b/forage-212715.appspot.com/o/groups%2Fprehistoric-001-512.png?alt=media&token=391571cb-6a0b-450d-8296-e26477b8cc40";
    const distance = props.event.data.distance ? <div className={styles.distance}><LocationOnOutlinedIcon /> {props.event.data.distance} miles away</div> : <div></div>;
    
    return (
        <div className={styles.container}>
            <div className={styles.sideWrapper}>
                <div className={styles.date}>{formedDate[0]}</div>
                <div className={styles.month}>{formedDate[1]}</div>
            </div>
            <Link to={`/events/${props.event.id}`}>
            <div className={styles.mainWrapper}>
                <div className={styles.image}><img src={img} /></div>
                <div className={styles.eventname}>{props.event.data.name}</div>
                {distance}
                <div className={styles.joinBtn}><Link to={`/events/${props.event.id}`}>
                    <span className={styles.joinBtn__text}>View </span>
                    <span className={styles.joinBtn__icon}><PlayArrowRoundedIcon /></span>
                    </Link></div>
                <div className={styles.about}>{formattedDetails}</div>
                <div className={styles.slots}>{props.event.data.slots - props.event.data.members.length} places left</div>

                    <div className={styles.time}>{props.event.data.time}</div>
                    <div className={styles.street}>{props.event.data.address.place}</div>
                    <div className={styles.groupname}>{props.event.data.groupName}</div>
                
                <div className={styles.viewPage}><Link to={`/groups/${props.event.data.groupId}`}>View Group ></Link></div>
            </div>
            </Link>
        </div>
    )
}

export default EventPreview;