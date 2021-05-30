import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/pages/MyProfile.module.scss';
import { getUserData, findUsersMembers } from '../../firebase/Firebase';

import { AuthContext } from '../../contexts/Auth.context';
import { MenuOptionsContext } from '../../contexts/MenuOptions.context';

import Account from '../subpages/Settings/Account/Account';
import Modal from '../UI/Modal';
import GroupTile from '../subcomponents/GroupPreview';

import ProfileUpcoming from '../subpages/Profile/ProfileUpcoming';
import ProfileInvites from '../subpages/Profile/ProfileInvites';
import ProfileRequests from '../subpages/Profile/ProfileRequests';

import Tooltip from '@material-ui/core/Tooltip';

import CakeOutlinedIcon from '@material-ui/icons/CakeOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import GroupWorkOutlinedIcon from '@material-ui/icons/GroupWorkOutlined';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import GroupIcon from '@material-ui/icons/Group';


function Profile(props){

    const { user } = useContext(AuthContext);
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);
    const [userData, setUserData] = useState('load');
    const [memberships, setMemberships] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOptions, setShowOptions] = useState(false);
    const [selectPage, setSelectPage] = useState("page");
    const hash = props.location.hash;

    console.log(userData)
    console.log(memberships)
    
    useEffect(() => {
        async function fetchData(){
            const userProfileData = await getUserData(user)
            setUserData(userProfileData)
      
            const membershipsData = await findUsersMembers(user)
            setMemberships(membershipsData);
            setLoading(false)
        }
        fetchData();
    }, [user])

    useEffect(() => {
        if(!hash && selectPage !== "page" || hash !== `#${selectPage}`){
            switch(hash){
                case "#upcoming":
                    setSelectPage("upcoming")
                    break;
                case "#invites":
                    setSelectPage("invites")
                    break;
                case "#requests":
                    setSelectPage("requests")
                    break;
                default:
                    setSelectPage("page")
            }
        }
    }, [hash])

    const optionArray = [{name: "Profile", url: <Link to='/myprofile'><AccountCircleIcon /></Link>, mobUrl: <Link to='/myprofile'>Profile</Link>, tag: ""}, 
                        {name: "Upcoming", url: <Link to='myprofile#upcoming'><AssignmentTurnedInIcon /></Link>, mobUrl: <Link to='myprofile#upcoming'>Upcoming</Link>, tag: "#upcoming"},
                        {name: "Invites", url: <Link to='myprofile#invites'><MailOutlineIcon /></Link>, mobUrl: <Link to='myprofile#invites'>Invites</Link>, tag: "#invites"},
                        {name: "Requests", url: <Link to='myprofile#requests'><GroupIcon /></Link>, mobUrl: <Link to='myprofile#requests'>Requests</Link>, tag: "#requests"}]
    
    useEffect(() => {
        setMenuOptions(optionArray);
        setMenuSettings("account");
    }, [])

    const settings = showOptions ? <><Modal showOptions={setShowOptions}> <Account /> </Modal></> : null;

    function getAge(dateString) {
        const today = new Date();
        const birthDate = new Date(dateString);
        const m = today.getMonth() - birthDate.getMonth();
        var age = today.getFullYear() - birthDate.getFullYear();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // PHANTOM LOADER
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
        
        const usersInformation = (<>
            <div className={styles.container__boxWrapper}>
                <div className={styles.container__boxWrapper__avatar}><a href={userData.avatar}><img src={userData.avatar} /></a></div>
                <div className={styles.container__boxWrapper__name}> {userData.firstname} {userData.privacySettings.hideSurname ? userData.surname.charAt(0) + "." : userData.surname}</div>
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
                    <h3>About</h3>
                    <p>{userData.about}</p>
                </div>
            </div>
            </>)

        var groupmap = memberships ? memberships.map(group => <><GroupTile group={group} /></>) : null;
           
        page = usersInformation;
    }
  

    const profpage = (
        <>
        {page}
        <div className={styles.container__header}>
            My Communities
        </div>
        <div className={styles.groupsWrapper}>
            {groupmap}
        </div>
        </>
    )

    var loadPage;
    if(selectPage === "page"){
        loadPage = profpage;
    } else if(selectPage === "upcoming"){
        loadPage = <ProfileUpcoming />
    } else if(selectPage === "invites"){
        loadPage = <ProfileInvites /> ;     
    } else if(selectPage === "requests"){
        loadPage = <ProfileRequests />
    }

    return (
        <>     
        {settings}
        <div className={styles.container}>
            {loadPage}
        </div>
        </>
    )
}

export default Profile;