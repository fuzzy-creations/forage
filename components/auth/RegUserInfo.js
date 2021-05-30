import React, { useContext, useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/Auth.context';
import { auth, uploadAvatar, registerUserInfo, getAvatar, checkCurrentUserId } from '../../firebase/Firebase';
import styles from '../../sass/auth/Register.module.scss';
import TextField from '@material-ui/core/TextField';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import FormLoader from '../UI/FormLoader';
import Loader from '../UI/Loader';
import styles_btn from '../../sass/_buttons.module.scss';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';
import PersonPinCircleOutlinedIcon from '@material-ui/icons/PersonPinCircleOutlined';
import { postcodeToInfo } from '../../tools/LocationHandler';

import Switch from '@material-ui/core/Switch';

function UserReg(props){
    const [userInfo, setUserInfo] = useState({});
    const {user, location, getLocation, getAddress} = useContext(AuthContext);
    const [foundAddress, setFoundAddress] = useState("")
    const [locationFound, setLocationFound] = useState(false);
    const [profileImage, setProfileImage] = useState('https://firebasestorage.googleapis.com/v0/b/forage-212715.appspot.com/o/avatars%2Fanon-user.png?alt=media&token=dcb8b312-8736-4a99-a4de-8920e102b285')
    const [imageFormat, setImageFormat] = useState('https://firebasestorage.googleapis.com/v0/b/forage-212715.appspot.com/o/avatars%2Fanon-user.png?alt=media&token=dcb8b312-8736-4a99-a4de-8920e102b285')
    const [redirect, setRedirect] = useState(false);
    const [loader, setLoader] = useState(false);
    const [avatarLoader, setAvatarLoader] = useState(false);
    const [error, setError] = useState();

    const [postcode, setPostcode] = useState("");
 
    const [stage, setStage] = useState(1);
    const [stageTwoStage, setStageTwoStage] = useState(0);
    const [stageOneStatus, setStageOneStatus] = useState(false)
    const [stageTwoStatus, setStageTwoStatus] = useState(false)
    const [stageThreeStatus, setStageThreeStatus] = useState(false)
    const [searching, setSearching] = useState(false);

    const [stageTwoMoreOptions, setStageTwoMoreOptions] = useState(<div className={`${styles.stageTwoOptions__options}`} onClick={() => moreOptionsHandler()}>More options</div>)
    //const [addressText, setAddressText] = useState("Finding location");

    const [addressReset, setAddressReset] = useState(false);

    const [fetchLocation, setFetchLocation] = useState(false);

    const [settings, setSettings] = useState({
        hideAge: false,
        hideLocation: false,
        hideSurname: false
      });

    function inputHandler(e){
        setUserInfo({...userInfo, [e.target.name]: e.target.value})
    }

    function register(){
            setLoader(true);
            if(!userInfo.about){userInfo.about = "Mysterious Forager"}
            if(!userInfo.age){userInfo.age = "1900-01-01"}
            var fullInfo = ({...userInfo, email: auth.currentUser.email, location: foundAddress, avatar: imageFormat, settings: settings})       
            if(fullInfo.location === ""){fullInfo.location = "Mystery location"}
            registerUserInfo(user, fullInfo).then(res => {
                if(res === true){
                    setLoader(false); 
                    setRedirect(true);
                } else {
                    setLoader(false);
                    setError(res);
                }
            })
     }

     if(redirect){return <Redirect to={`/myprofile`} /> }


    if(location && foundAddress === "" && fetchLocation) {      
        async function getAddressHandler(){
            var data = await getAddress()
            if(data.district){
                setLocationFound(true)
                setFoundAddress(data.district)
                setSearching(false);
                setFetchLocation(false);
                setStageTwoStage(2)
            } else {
                setLocationFound(false)
                setFoundAddress("Location not found")
                setSearching(false);
                setFetchLocation(false);
            }
        }
        getAddressHandler(location)
    } 

    function nextStageHandler(){
        if(stageOneStatus === false){
            setError("Please complete the form")
        } else {
            setStage(2)
        }
    }

    function completeFormHandler(e){   
        e.preventDefault()
        if(stageOneStatus === false){
            setError("Please complete the form")
        } else {
            register(e)
        }
    }

      
    async function uploadImage(e){
        setAvatarLoader(true);
        var file = e.target.files[0]
        await uploadAvatar(file, user).then((res) => {
        }).then(async () => {
            var userImage = await getAvatar(user)
            const userImageResolution = userImage.replace(user, `${user}_800x600`)
            setImageFormat(userImageResolution);
            setProfileImage(userImage);
            setAvatarLoader(false);
        }).catch(err => {
            setError(err.message)
            setAvatarLoader(false)
        })
    }
    
    var avatar = avatarLoader ?  <div className={styles.form__avatar__loader}></div> : <img src={profileImage} />;

    const handleChange = (event) => {
        setSettings({ ...settings, [event.target.name]: event.target.checked });
      };

    if(stageOneStatus === false && userInfo.firstname && userInfo.surname){
        setStageOneStatus(true) 
        setError("");
    }
    if(stageOneStatus === true && (!userInfo.firstname || !userInfo.surname)){
        setStageOneStatus(false)
    }
    if(stageTwoStatus === false && locationFound){
        setStageTwoStatus(true) 
        setError("");
    }
    if(stageTwoStatus === true && !locationFound){
        setStageTwoStatus(false)
    }

    const stageOne = (
        <div className={styles.form__grid}>
            <TextField className={`${styles.form__input} ${styles.form__grid__first}`} name="firstname" type="text" label="First name" defaultValue={userInfo.firstname} onChange={(e) => inputHandler(e)} variant="outlined" required/>
            <TextField className={`${styles.form__input} ${styles.form__grid__surname}`} name="surname" type="text" label="Surname" defaultValue={userInfo.surname} onChange={(e) => inputHandler(e)} variant="outlined" required />
            
                <input className={`${styles.form__grid__date}`} type="date" id="age" name="age"  defaultValue="1980-01-01" min="1950-01-01" max="2001-01-01" onChange={(e) => inputHandler(e)} />
                <label className={styles.form__grid__dateLabel} for="age">Birth</label>

            <div className={styles.form__grid__toggle1}>
                <Switch onChange={handleChange} color="primary" name="hideAge" inputProps={{ 'aria-label': 'primary checkbox' }} />
                <div className={styles.form__address__toggle__text}>Hide</div>
            </div>
            <button type="submit" className={`${styles_btn.btn__cont} ${stageOneStatus === false ? styles_btn.btn__inactive : styles_btn.btn__active} ${styles.form__grid__cont}`} onClick={() => {
                nextStageHandler()
                setFetchLocation(true)          
                }}><p>Continue </p><ArrowForwardRoundedIcon /></button>    
        </div>
    )

    function moreOptionsHandler(){

        setStageTwoMoreOptions(<div className={`${styles.stageTwoOptions__btn}`} onClick={() => setStageTwoStage(1)}>Enter postcode</div>)
    }

    function enableLocationHandler(){
        setSearching(true);
        setFetchLocation(true);
        getLocation().then(() => {
            setStageTwoStage(2)
        })
    
    }

    function wrongHandler(){
        setStageTwoStage(1)
        setAddressReset(true)
    }

    if(addressReset){
        setFoundAddress("")
        setAddressReset(false)
    }

    async function postcodeHandler(e){
        setSearching(true)
        const data = await postcodeToInfo(postcode)
        if(data.district){
            setLocationFound(true);
            setFoundAddress(data.district)
            setSearching(false)
        } else {
            setLocationFound(false);
            setAddressReset(true);
            setFoundAddress("Postcode not found")
        }
    }


    var textAddress = searching ? "..." : "Finding location";

    const hideLocationToggle = locationFound ? (<><Switch onChange={handleChange} color="primary" name="hideLocation" inputProps={{ 'aria-label': 'primary checkbox' }} />
        <div className={styles.form__address__toggle__text}>Hide</div></>) : null;

    if(foundAddress){textAddress = (
        <div className={styles.stageTwo__row}>
            <div className={styles.stageTwo__text}>{foundAddress}</div>
            <div className={styles.stageTwo__toggle}>
               {hideLocationToggle}
            </div>   
        </div>
    )}
    
    const stageTwoOptions = (
        <div className={styles.stageTwoOptions}>
            <div className={`${styles.stageTwoOptions__btn}`} onClick={() => enableLocationHandler()}>Enable location</div>
            {stageTwoMoreOptions}
        </div>
    )

    const stageTwoFound = (
        <div className={styles.stageTwoOptions}>
            <div className={`${styles.stageTwoOptions__options}`} onClick={() => wrongHandler()}>Wrong?</div>
        </div>
    )

    const postcodeKeyHandler = (e) => {
        if(e.key === "Enter"){        
           postcodeHandler()
        }
    }
    


    const stageTwoPostCode = (
        <>
        <div>Enter Postcode</div>
        <TextField className={styles.form__input} type="text" label="Postcode" onChange={(e) => setPostcode(e.target.value)} onBlur={() => postcodeHandler()} onKeyPress={postcodeKeyHandler} variant="outlined" />   
        </>
    )

    
    var phase;
    switch(stageTwoStage){
        case 0:
            phase = stageTwoOptions;
        break;
        case 1:
            phase = stageTwoPostCode;
        break;
        case 2:
            phase = stageTwoFound;
        break;
        default: 
            phase = <div>Error</div>
    }

    var nextButtons = (
        <>
        <button className={`${styles_btn.btn__back}`} type="button" onClick={() => {
            setStage(1)
            setStageTwoStage(0)
            setAddressReset(true)
            }}><ArrowBackRoundedIcon /></button>
        <button className={`${styles_btn.btn__cont} ${stageTwoStatus === false ? styles_btn.btn__inactive : styles_btn.btn__active}`} type="button" onClick={(e) => setStage(3)}><p>Continue </p><ArrowForwardRoundedIcon /></button>
        </>
    )
    


    const stageTwo = (
        <div className={styles.stageTwo}>
            <div className={styles.stageTwo__icon}><PersonPinCircleOutlinedIcon /></div>
            <div className={styles.stageTwo__text}>{textAddress}</div>
            <div className={styles.stageTwo__wrapper}>{phase}</div>            
            <div className={styles.form__btngroup}>{nextButtons}</div>
        </div>
    )




    var contButtons = (
        <>
        <button className={`${styles_btn.btn__back}`} type="button" onClick={() => setStage(2)}><ArrowBackRoundedIcon /></button>
        <button className={`${styles_btn.btn__cont} ${stageOneStatus === false ? styles_btn.btn__inactive : styles_btn.btn__active}`} type="submit" onClick={(e) => completeFormHandler(e)}><p>Create </p><ArrowForwardRoundedIcon /></button>
        </>
    )
    

    if(loader){contButtons = <FormLoader />}


    
    const stageThree = (
        <>
        <div className={styles.form__wrapper2}>
            <div>
                <div className={styles.form__avatar}> 
                    <div className={styles.form__avatar__image}>{avatar}</div>
                    <div>Choose an Avatar</div>
                </div>
                <input name="image" type="file" accept="image/*" onChange={(e) => uploadImage(e)} /> 
            </div>
            <div>
                <p className={styles.form__about__text}>Write your about</p>
                <TextField className={styles.form__input} multiline rows="4" name="about" type="text" label="About" onChange={(e) => inputHandler(e)} variant="outlined" />
            </div>
        </div>
        <div className={styles.form__btngroup}>
           {contButtons}
        </div>
        </>
    )
    var form;
    var title;

    switch(stage){
        case 1:
            form = stageOne;
            title = "Create your profile";
        break;
        case 2:
            form = stageTwo;
            title = "Location info";
        break;
        case 3:
            form = stageThree;
            title = "Optional extras";
        break;
        default: 
            form = <div>Error</div>
    }



    return (
        <>
        <div className={styles.form__header}>
            <div className={styles.form__header__logo}><Link to="/"><img src='/forage-logo-red.png' /></Link></div>
            <h1 className={styles.form__header__title}>{title}</h1>
        </div>
        <div className={styles.form__stepper}>Step {stage} of 3</div>
        {form}  
        {error}
        </>
    )
}

export default UserReg;

