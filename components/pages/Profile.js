import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { getUserData, findUsersMembers, getGroupData } from '../../firebase/Firebase';
import { AuthContext } from '../../contexts/Auth.context';
import { MenuOptionsContext } from '../../contexts/MenuOptions.context';
import styles from '../../sass/pages/MyProfile.module.scss';
import GroupTile from '../subcomponents/GroupPreview';

import CakeOutlinedIcon from '@material-ui/icons/CakeOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import GroupWorkOutlinedIcon from '@material-ui/icons/GroupWorkOutlined';

import Tooltip from '@material-ui/core/Tooltip';


function Profile(props){
    const params = props.match.params.id;
    const { user } = useContext(AuthContext);
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);
    const [userData, setUserData] = useState('load');
    const [memberships, setMemberships] = useState(null);
    const [loading, setLoading] = useState(true);

    const hash = props.location.hash;

    const optionArray = []
    
    useEffect(() => {
        setMenuOptions(optionArray);
        setMenuSettings(null)
    }, [])

    
    useEffect(() => {
        async function fetchData(){
            var userProfileData = await getUserData(params)
            setUserData(userProfileData)
      
            var membershipsData = await findUsersMembers(params)
            const filteredGroups = membershipsData.filter(group => group.data.privacySettings.hidden === false)
            setMemberships(filteredGroups);
            setLoading(false)
        }
        fetchData();
    }, [params, user])
    
    if(user === params){return <Redirect to="/myprofile" />}

    if(!userData){
        return <h1>User not found</h1>
    }

    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    var page = (
        <>
        <div className={styles.phantom__boxWrapper}>
            <div className={styles.phantom__boxWrapper__avatar}></div>
            <div className={styles.phantom__boxWrapper__name}></div>
            <div className={styles.phantom__boxWrapper__age}>
                <span className={styles.phantom__boxWrapper__icon}></span>

            </div>
            <div className={styles.phantom__boxWrapper__location}>
                <span className={styles.phantom__boxWrapper__icon}></span>
                    
            </div>
            <div className={styles.phantom__boxWrapper__groupNum}>
                <span className={styles.phantom__boxWrapper__icon}></span>
                
            </div>      
            <div className={styles.phantom__boxWrapper__bioText}>
                <div className={styles.phantom__boxWrapper__bioTitle}></div>
                
            </div>
        </div>
        </>
    )
    
    if(!loading && userData){     
        var usersInformation = (<>
            <div className={styles.container__boxWrapper}>
                <div className={styles.container__boxWrapper__avatar}><a href={userData.avatar}><img src={userData.avatar} /></a> </div>
                <div className={styles.container__boxWrapper__name}> {userData.firstname} {userData.surname.charAt(0)}.</div>
                <div className={styles.container__boxWrapper__age}>
                    <span className={styles.container__boxWrapper__icon}>
                    <Tooltip title={<div style={{fontSize: "1rem"}}>Age</div>}>
                        <CakeOutlinedIcon/>             
                    </Tooltip>                      
                        </span>
                      {userData.privacySettings.hideAge ? "Unknown" : getAge(userData.age)} 
                </div>
                <div className={styles.container__boxWrapper__location}>
                    <span className={styles.container__boxWrapper__icon}>
                    <Tooltip title={<div style={{fontSize: "1rem"}}>Location</div>}>
                        <LocationOnOutlinedIcon />
                        </Tooltip>
                    </span>
                      {userData.privacySettings.hideLocation ? "Mystery location" : userData.location} 
                </div>
                <div className={styles.container__boxWrapper__groupNum}>
                    <span className={styles.container__boxWrapper__icon}>
                    <Tooltip title={<div style={{fontSize: "1rem"}}>Memberships</div>}>
                        <GroupWorkOutlinedIcon />
                        </Tooltip>
                        </span>
                     {memberships.length}
                </div>        
                <div className={styles.container__boxWrapper__bioText}>
                    <div className={styles.container__boxWrapper__bioTitle}>About</div>
                    {userData.about}
                </div>
            </div>
            </>)


        var groupmap = memberships ? groupmap = memberships.map(group => <><GroupTile group={group} /></>) : null;

        
        page = usersInformation;
    }

    return (
        <>
        
        <div className={styles.container}>   
                {page}    
            <div className={styles.container__header}>
                My Communities
            </div>
            <div className={styles.groupsWrapper}>
                {groupmap}
            </div>
        </div>
        </>
    )
}

export default Profile;