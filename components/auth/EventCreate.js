

import React, { useEffect, useState, useContext } from 'react';
import styles from '../../sass/auth/EventCreate.module.scss';
import useInputState from '../../hooks/useInputState';
import { DateTimeContext } from '../../contexts/DateTime.context';
import { findGroupsEvents, createEvent, uploadEventImage, getEventImage } from '../../firebase/Firebase';
import Search from '../../tools/SearchAuto';
import { AuthContext } from '../../contexts/Auth.context';
import IDGenerator from '../../tools/IDGenerator';
import { postcodeToInfo } from '../../tools/LocationHandler';
import TextField from '@material-ui/core/TextField';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import styles_btn from '../../sass/_buttons.module.scss';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';

function EventCreate(props){
    const [profileInfo, setProfileInfo] = useState(null);
    const [eventInfo, setEventInfo] = useState("");
    const { user, userAdmin, userMods } = useContext(AuthContext)
    const [banner, setBanner] = useState('https://firebasestorage.googleapis.com/v0/b/forage-212715.appspot.com/o/avatars%2Fanon-user.png?alt=media&token=dcb8b312-8736-4a99-a4de-8920e102b285');
    const [lowResolutionImage, setLowResolutionImage] = useState('https://firebasestorage.googleapis.com/v0/b/forage-212715.appspot.com/o/avatars%2Fanon-user.png?alt=media&token=dcb8b312-8736-4a99-a4de-8920e102b285');

    const { localDateTime, localToUtc, utcToLocal, formatDateTime } = useContext(DateTimeContext);
    const [ formDate, setFormDate ] = useState(localDateTime);
    const [ formTime, setFormTime ] = useState("");

    const [postcode, setPostcode] = useState(false);
    const [address, setAddress] = useState({
                name: "",
                street1: "",
                place: "",
                district: "", 
                region: "",
                postcode: ""
    });
    const [geo, setGeo] = useState({});
    
    const [selectedDate, setSelectedDate] = React.useState(new Date('2014-08-18T21:11:54'));

    const [stage, setStage] = useState(0);

    const [stageOneStatus, setStageOneStatus] = useState({status: 0, errors: {name: ""}})
    const [stageTwoStatus, setStageTwoStatus] = useState({status: 0, errors: {details: ""}})
    const [stageThreeStatus, setStageThreeStatus] = useState({status: 0, errors: {name: ""}})
    const [stageFourStatus, setStageFourStatus] = useState({status: 0, errors: {name: ""}})
    const [formComplete, setFormComplete] = useState(false);
    const [error, setError] = useState("");

    const [autoStatus, setAutoStatus] = useState(false);

    const groupId = props.match.params.id

    const eventId = IDGenerator();

    useEffect(() => {
        async function fetchData(){
            var findEvents = await findGroupsEvents(groupId);
            const singleEvents = findEvents.filter((event, index, self) => {
            return index === self.findIndex((e) => {
                return e.data.name === event.data.name
            })
        })
            setProfileInfo(singleEvents);
            if(!findEvents[0]){
                setStage(1)
            }
        }
        fetchData()
    }, [])


    if(!groupId){return <h1>Group not found</h1>}
    if((userAdmin && !userAdmin.includes(groupId)) && userMods && !userMods.includes(groupId)){return <h1>You do not own this group</h1>}

    function createEventProfile(e){
        // e.preventDefault();
        if(formComplete){
            var utcDate = localToUtc(formDate);
            var newData = {...eventInfo, date: utcDate, address: address, creatorId: user, groupId: groupId, location: "london", image: lowResolutionImage, id: eventId, geo: geo};
            createEvent(newData).then((res) => {
                if(res){
                    props.history.push(`/events/${res}`)
                } else {
                    console.log("ERROR")
                }
            });
        } else {
            setError("Please complete the form")
        }
    }

    function inputHandler(e){
        console.log(eventInfo)
        setEventInfo({...eventInfo, [e.target.name]: e.target.value})
    }

    var templateButtons;
    if(profileInfo){
        templateButtons = profileInfo.map((event) => {
            console.log(event)
            return <button className={styles.form__templatebtns} onClick={() => {
                setAddress(event.data.address)
                delete event.data.address
                delete event.data.time
                delete event.data.date
                setGeo(event.data.geo)
                setEventInfo(event.data)
                setBanner(event.data.image);
                setPostcode(true)
                setStage(4)
                setAutoStatus(true)
            }}>{event.data.name}</button>
        }).slice(0, 5)
    }

    async function uploadImage(e){
        var file = e.target.files[0]
        await uploadEventImage(file, groupId, eventId).then((res) => {
        }).then(async () => {
            var eventImage = await getEventImage(groupId, eventId)
            const imageResolution = eventImage.replace(eventId, `${eventId}_800x600`)
            setLowResolutionImage(imageResolution)
            setBanner(eventImage)
        }).catch(err => console.log(err.message))
    }
    
    var eventImage = <img style={{width: '40px', height: 'auto'}} src={banner} />    

    function nextStage(){
        var newStage = stage + 1;
        setStage(newStage)
    }
    function backStage(){
        var newStage = stage - 1;
        setStage(newStage)
    }


    const stageOptions = (
        <>
        <div className={styles.form}>
        <div className={styles.form__header}>Recreate a Previous Event</div>
        <div className={styles.form__templates}>{templateButtons}</div>
        <div className={styles.form__header}>Or</div>
        <div className={styles.form__newbtn} onClick={() => setStage(1)}>Create a brand new event</div>
        </div>
        </>
    )

    const handleSliderChange = (event, newValue) => {
      setEventInfo({...eventInfo, slots: newValue})
    };
  
    console.log(eventInfo)

    if(autoStatus){
        checkStatus(1)
        checkStatus(2)
        checkStatus(3)
        setAutoStatus(false)
    }


    function checkStatus(stage){
        console.log("checking status " + stage)
        if(stage === 1){
            let valid = validation(1)
            let status = checkCompletition(1)
            if(valid){           
                setStageOneStatus({...stageOneStatus, status: 2, errors: {name: valid}})
            } else if(!valid && status === 0) {
                setStageOneStatus({...stageOneStatus, status: 0, errors: {name: ''}})
            } else if(!valid && status === 1){
                setStageOneStatus({...stageOneStatus, status: 1, errors: {name: ''}})
            }
        } else if(stage === 2){
            let valid = validation(2)
            let status = checkCompletition(2)
            if(valid){           
                setStageTwoStatus({...stageTwoStatus, status: 2, errors: {details: valid}})
            } else if(!valid && status === 0) {
                setStageTwoStatus({...stageTwoStatus, status: 0, errors: {details: ''}})
            } else if(!valid && status === 1){
                setStageTwoStatus({...stageTwoStatus, status: 1, errors: {details: ''}})
            }
        } else if(stage === 3){
            let valid = validation(3)
            let status = checkCompletition(3)
            if(valid){           
                setStageThreeStatus({...stageThreeStatus, status: 2, errors: {details: valid}})
            } else if(!valid && status === 0) {
                setStageThreeStatus({...stageThreeStatus, status: 0, errors: {details: ''}})
            } else if(!valid && status === 1){
                setStageThreeStatus({...stageThreeStatus, status: 1, errors: {details: ''}})
            }
        } else if(stage === 4){
            let valid = validation(4)
            let status = checkCompletition(4)
            if(valid){           
                setStageFourStatus({...stageFourStatus, status: 2, errors: {details: valid}})
            } else if(!valid && status === 0) {
                setStageFourStatus({...stageFourStatus, status: 0, errors: {details: ''}})
            } else if(!valid && status === 1){
                setStageFourStatus({...stageFourStatus, status: 1, errors: {details: ''}})
            }
        } 
    }



    function validation(stage){
        if(stage === 1 && eventInfo.name){
            if(eventInfo.name.length > 30 || eventInfo.name.length < 3){
                return `${eventInfo.name.length} characters must be between 3-30`;
            } else {
                return false 
            }
        }
        if(stage === 2){
            return false
        }
        if(stage === 3){
            return false
        }
        if(stage === 4){
            return false
        }
    }

    function checkCompletition(stage){
        if(stage === 1) {
            if(eventInfo.name && eventInfo.outreach && eventInfo.slots){
               return 1
            } else {
               return 0
            }
        } else if(stage === 2) {
            if(eventInfo.description){
                return 1
            } else {
                return 0
            }

        } else if(stage === 3) {
            if(address.street1 && address.name && address.postcode){
                return 1
            } else {
                return 0
            }
        } else if (stage === 4){
            if(eventInfo.time && formDate){
                return 1
            } else {
                return 0
            }
        }
    }
    console.log(address)

    console.log(stageOneStatus)
    var stepper = <div onClick={() => setStage(1)}>
    <div>{stageOneStatus.toString()}</div>
    {/* <div>Information</div>           */}
</div>
        
    const stageOne = (
        <>
        <div className={styles.form}>
            <div className={styles.form__header}>Information</div>
            <TextField id="outlined-basic" 
            label="Event name" name="name" variant="outlined" 
            error={stageOneStatus.errors.name ? true : false}
            helperText={stageOneStatus.errors.name}
            defaultValue={eventInfo.name} 
            onBlur={() => checkStatus(1)}
            onChange={(e) => inputHandler(e)}  /> 

            <h3 className={styles.form__title}>Select Type</h3>
            <div className={styles.middle}>
                <label onClick={() => checkStatus(1)} >
                    <input type="radio" id="Public" name="outreach" value="public" onClick={(e) => inputHandler(e)} checked={eventInfo.outreach === "public" ? true : false} />
                    <div className={`${styles.box}`}>
                        <span>Public</span>
                </div>
                </label>
                <label onClick={() => checkStatus(1)}>
                    <input type="radio" id="Private" name="outreach" value="private" onClick={(e) => inputHandler(e)} checked={eventInfo.outreach === "private" ? true : false} />
                    <div className={`${styles.box}` }>
                        <span>Private</span>
                    </div>
                </label>
            </div>
            <div>
            Slots: {eventInfo.slots ? eventInfo.slots : 10} 
          <Slider
            value={typeof eventInfo.slots === 'number' ? eventInfo.slots : 10}
            onChange={handleSliderChange}
            onBlur={() => checkStatus(1)}
            aria-labelledby="input-slider"
          /> 
            </div>
            <h3>Image</h3>
            {eventImage}
            <input name="image" type="file" accept="image/*" onChange={(e) => uploadImage(e)} onBlur={() => checkStatus(1)} /> 
            <div className={styles.form__btnWrapper}>
                <button className={styles_btn.btn__back} onClick={() => backStage()}><ArrowBackRoundedIcon /></button>
                <button className={styles_btn.btn__cont} onClick={() => nextStage()}><p>Next</p> <ArrowForwardRoundedIcon /></button>
            </div>
        </div>
        </>
    )

    const stageTwo = (
        <>
        <div className={styles.form}>
            <div className={styles.form__header}>Details</div>
            <textarea className={styles.form__textarea} onBlur={() => checkStatus(2)} wrap="hard" cols="50" rows="10" name="description" value={eventInfo.description} type="text" onChange={(e) => inputHandler(e)} />
            <div className={styles.form__btnWrapper}>
                <button className={styles_btn.btn__back} onClick={() => backStage()}><ArrowBackRoundedIcon /></button>
                <button className={styles_btn.btn__cont} onClick={() => nextStage()}><p>Next</p> <ArrowForwardRoundedIcon /></button>
            </div>
        </div>
        </>
    )

    async function postcodeHandler(e){
        console.log(e)
        console.log(address)
        const data = await postcodeToInfo(address.postcode)
        if(data.place){
            setError("")
            setPostcode(true);
            setAddress({
                ...address, 
                region: data.region,
                district: data.district, 
                place: data.place
            })
            setGeo({
                lat: data.lat,
                lng: data.lng
            })
        } else {
            setError("Postcode not found")
        }
    }

    const formPostcode = <TextField className={styles.form__wrapper__postcode} id="outlined-basic" label="Postcode" variant="outlined" name="postcode" onBlur={(e) => postcodeHandler(e)} defaultValue={address.postcode} onChange={(e) => setAddress({...address, [e.target.name]: e.target.value})} />
         
    const formInputs = (
        <>
        <TextField id="outlined-basic" label="Name or number" variant="outlined" name="name" onBlur={() => checkStatus(3)} value={address.name} onChange={(e) => setAddress({...address, [e.target.name]: e.target.value})} />
        <TextField id="outlined-basic" label="Address Line 1" variant="outlined" name="street1" onBlur={() => checkStatus(3)} defaultValue={address.street1} onChange={(e) => setAddress({...address, [e.target.name]: e.target.value})} />
        </>
    )
    const fullForm = (
        <>
        <div className={styles.form__text}>{address.place}</div>
        <div className={styles.form__text}>{address.district}</div>
        <div className={`${styles.form__text} ${styles.form__wrapper__region}`}>{address.region}</div>
       </>
    )

    // <div>{address.place}</div>
    //     <div>{address.district}</div>
    //     <div>{address.region}</div>


    const stageThree = (
        <>
        <div className={styles.form}>
            <div className={styles.form__header}>Address</div>
            <div className={styles.form__wrapper}>
                {postcode ? formInputs : null}
                {postcode ? fullForm : null}
                {formPostcode}
            </div>
            <div className={styles.form__btnWrapper}>
                <button className={styles_btn.btn__back} onClick={() => backStage()}><ArrowBackRoundedIcon /></button>
                <button className={styles_btn.btn__cont} onClick={() => nextStage()}><p>Next</p> <ArrowForwardRoundedIcon /></button>
            </div>
        </div>
        </>
    )

    if(formComplete === false && (stageOneStatus.status === 1 && stageTwoStatus.status === 1 && stageThreeStatus.status === 1 && stageFourStatus.status === 1)){
        setFormComplete(true)
    }
    if(formComplete === true && (stageOneStatus.status !== 1 || stageTwoStatus.status !== 1 || stageThreeStatus.status !== 1 || stageFourStatus.status !== 1)){
        setFormComplete(false)
    }

    const stageFour = (
        <>
        <div className={styles.form}>
            <div className={styles.form__header}>When</div>
            <label for="date">Start date:</label>
            <input type="date" id="date" name="date"  onBlur={() => checkStatus(4)} value={formDate} min={formatDateTime(localDateTime).date} max={null} onChange={(e) => setFormDate(e.target.value)} />
            <label for="time">Start time:</label>
            <input type="time" id="time" name="time"  onBlur={() => checkStatus(4)} onChange={(e) => inputHandler(e)} />
            <div className={styles.form__btnWrapper}>
                <button className={styles_btn.btn__back} onClick={() => backStage()}><ArrowBackRoundedIcon /></button>
                <button className={`${styles_btn.btn__cont} ${formComplete === false ? styles_btn.btn__inactive : styles_btn.btn__active}`} onClick={(e) => createEventProfile(e)}><p>Create</p><ArrowForwardRoundedIcon /></button>
            </div>
        </div>
        </>
    )

    var form;

    switch(stage){
        case 0:
            form = stageOptions
        break;
        case 1:
            form = stageOne
        break;
        case 2:
            form = stageTwo
        break;
        case 3:
            form = stageThree
        break;
        case 4:
            form = stageFour
        break;
        default: 
            form = <div>Error</div>
    }

    
    return (
        <>
        <div className={styles.wrapper}>
            <div className={styles.container}>
            <div className={styles.form__stepper}> 
                <div className={styles.form__stepper__wrapper}>
                    <span onClick={() => setStage(1)} className={`${styles.form__stepper__icon} ${stageOneStatus.status === 1 ? styles.form__stepper__icon__done : ""} ${stageOneStatus.status === 2 ? styles.form__stepper__icon__error : ""}`}>1</span> 
                    <span className={styles.form__stepper__text}>Info</span>
                </div>
                <div className={styles.form__stepper__line}></div>
                <div className={styles.form__stepper__wrapper}>
                    <span onClick={() => setStage(2)} className={`${styles.form__stepper__icon} ${stageTwoStatus.status === 1 ? styles.form__stepper__icon__done : ""} ${stageTwoStatus.status === 2 ? styles.form__stepper__icon__error : ""}`}>2</span> 
                    <span className={styles.form__stepper__text}>Details</span>
                </div>
                <div className={styles.form__stepper__line}></div>
                <div className={styles.form__stepper__wrapper}>
                    <span onClick={() => setStage(3)} className={`${styles.form__stepper__icon} ${stageThreeStatus.status === 1 ? styles.form__stepper__icon__done : ""} ${stageThreeStatus.status === 2 ? styles.form__stepper__icon__error : ""}`}>3</span> 
                    <span className={styles.form__stepper__text}>Address</span>
                </div>
                <div className={styles.form__stepper__line}></div>
                <div className={styles.form__stepper__wrapper}>
                    <span onClick={() => setStage(4)} className={`${styles.form__stepper__icon} ${stageFourStatus.status === 1 ? styles.form__stepper__icon__done : ""} ${stageFourStatus.status === 2 ? styles.form__stepper__icon__error : ""}`}>4</span> 
                    <span className={styles.form__stepper__text}>Location</span>
                </div>
            </div>
                {form}
                {error}
            </div>    
        </div>
        </>
    )
}

export default EventCreate;
