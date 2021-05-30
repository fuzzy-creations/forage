import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/Auth.context';
import { DateTimeContext } from '../../contexts/DateTime.context';

import styles from '../../sass/pages/GroupPage.module.scss';

import GroupActionText from '../subcomponents/GroupActionButton';

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import { MdLocationOn } from "react-icons/md"
import { MenuOptionsContext } from '../../contexts/MenuOptions.context';

function GroupPagePrivate(props){    
    const { user } = useContext(AuthContext);
    const { localDateTime, utcToLocal, dateAfter, dateBefore } = useContext(DateTimeContext);
    const [selectPage, setSelectPage] = useState("page");
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);
    const [access, setAccess] = useState(true);
   

    const optionArray = [{name: "Profile", url: <Link to={`/groups/${props.params}`}><HomeOutlinedIcon /></Link>, mobUrl: <Link to={`/groups/${props.params}`}>Profile</Link>, tag: ""}]

    useEffect(() => {
        setMenuOptions(optionArray);
    }, [props.params])



    const btnOptions = <GroupActionText groupId={props.params} groupName={props.groupData.name} userId={user} />

       var groupPage = (
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
                <div className={styles.group__private}>
                    <div className={styles.group__private__icon}><InfoOutlinedIcon /></div>
                    <div className={styles.group__private__text}>This community is private</div>
                    <div className={styles.group__private__para}>Join to get access</div>
                </div>
                </>       
            )


    return (
        <div className={styles.container}>
            {groupPage}
        </div>
    )
}

export default GroupPagePrivate;
