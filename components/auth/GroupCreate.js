import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import useInputState from '../../hooks/useInputState';
import { AuthContext } from '../../contexts/Auth.context';
import { createGroup, uploadLogo, getLogo } from '../../firebase/Firebase';
import styles from '../../sass/auth/GroupCreate.module.scss';
import styles_btn from '../../sass/_buttons.module.scss';
import IDGenerator from '../../tools/IDGenerator';
import TextField from '@material-ui/core/TextField';
import FormLoader from '../UI/FormLoader';

import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';

import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';


function GroupCreate(props){
    const [groupInfo, setGroupInfo] = useState({});
    const [logoImage, setLogoImage] = useState('https://firebasestorage.googleapis.com/v0/b/forage-212715.appspot.com/o/avatars%2Fanon-user.png?alt=media&token=dcb8b312-8736-4a99-a4de-8920e102b285')
    const [logoFormat, setLogoFormat] = useState('https://firebasestorage.googleapis.com/v0/b/forage-212715.appspot.com/o/avatars%2Fanon-user.png?alt=media&token=dcb8b312-8736-4a99-a4de-8920e102b285')
    const { user, username, userAdmin } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    const [stage, setStage] = useState(0);
    const [stage2Status, setStage2Status] = useState(null);
    const [stage3Status, setStage3Status] = useState(null);
    const [error, setError] = useState("");

    const id = IDGenerator()

    const keyNextHandler = (e) => {
        if(e.key === "Enter"){        
           setStage(stage + 1);
        }
    }
    const keyContHandler = (e) => {
        if(e.key === "Enter"){        
           createGroupProfile(e)
        }
    }

    if(!user){
        return <Redirect to="/register" />
    } else if(userAdmin && userAdmin.length > 7){
        return <h1>You can't create another group - max 8</h1>
    }

    function createGroupProfile(e){
        setLoading(true)
        try {
            createGroup({...groupInfo, userId: user, logo: logoFormat, location: "London", id: id}).then(async (res) => {
                props.history.push(`groups/${id}`);
            })
        } catch(error) {
            setLoading(false)
            setError(error)
        }
    }

    function inputHandler(e){
        setGroupInfo({...groupInfo, [e.target.name]: e.target.value})
    }

    async function uploadImage(e){
        setUploadingImage(true);
        var file = e.target.files[0]
        await uploadLogo(file, id).then(async (res) => {
            var groupImage = await getLogo(id)
            const logoResolution = groupImage.replace("logo", "logo_800x600")
            setLogoImage(groupImage)
            setLogoFormat(logoResolution)
            setUploadingImage(false);
        }).catch(err => {
            setError(err.message);
            setUploadingImage(false);
        })
    }

    function nextStage(){
        var newStage = stage + 1;
        setStage(newStage)
    }
    function backStage(){
        var newStage = stage - 1;
        setStage(newStage)
    }

    const stageGo = (
        <div className={styles.form__wrapper2}>
            <h1 className={styles.form__header}  onClick={() => nextStage()}>Create your own Community</h1>
            <div className={styles.form__imagearea}></div>
            <button className={`${styles.form__goBtn} ${styles_btn.btn__back}`} onClick={() => nextStage()}><ArrowForwardRoundedIcon /></button>

        </div>
    )

    const stageOne = (
        <div className={styles.form__wrapper}>
            <h3 className={styles.form__title}>Select type</h3>
            <div className={styles.middle}>
                <label>
                    <input type="radio" name="grouptype" value="charity" onChange={(e) => inputHandler(e)} onClick={() => nextStage()} />
                    <div className={`${styles.front_end} ${styles.box}`}>
                        <span>Charity</span>
                </div>
                </label>
                <label>
                    <input type="radio" name="grouptype" value="business" onChange={(e) => inputHandler(e)} onClick={() => nextStage()} />
                    <div className={`${styles.middle_end} ${styles.box}` }>
                        <span>Business</span>
                    </div>
                </label>
                <label>
                    <input type="radio" name="grouptype" value="casual" onChange={(e) => inputHandler(e)} onClick={() => nextStage()} />
                    <div className={`${styles.back_end} ${styles.box}` }>
                        <span>Casual</span> 
                    </div>
                </label>
            </div>
        </div>
    )

    const stageTwo = (
        <div className={styles.form__wrapper}>
            <h3 className={styles.form__title__two}>What are you <br />called?</h3>
            <input type="text" className={styles.form__stageTwoInput} defaultValue={groupInfo.name} name="name" onChange={(e) => inputHandler(e)} onKeyPress={keyNextHandler} /> 
            <div className={styles.form__buttonWrapper}>
                <button type="button"  className={`${styles_btn.btn__back} ${styles.form__button}`} onClick={() => backStage()}><ArrowBackRoundedIcon /></button>
                {stage2Status ? <button className={`${styles.form__stageTwoBtn} ${styles_btn.btn__back} ${styles.form__button}`} onClick={() => nextStage()}><ArrowForwardRoundedIcon /></button> : <div></div> }
            </div>

        </div>
    )

    if(!stage2Status && groupInfo.name && groupInfo.name.length > 2 && groupInfo.name.length < 21){
        setStage2Status(true)
        setError("")
    } 
    if(stage2Status && groupInfo.name && (groupInfo.name.length < 3 || groupInfo.name.length > 20)){
        setStage2Status(false)
        setError("Name must be between 3-20 characters");
    } 


    var logo = uploadingImage ? <div className={styles.form__logoLoader}></div> : <img className={styles.form__logo} src={logoImage} />;

    var btns3 = (
        <>
        <button type="button"  className={`${styles.form__button} ${styles_btn.btn__back}`} onClick={() => backStage()}><ArrowBackRoundedIcon /></button>
        <button type="submit" className={`${styles.form__button} ${styles_btn.btn__cont} ${stage3Status ? styles_btn.btn__active : styles_btn.btn__inactive}`} onClick={stage3Status ? (e) => createGroupProfile(e) : null}><p>Create </p><ArrowForwardRoundedIcon /></button>               
        </>
    )
    if(loading){
        btns3 = <FormLoader />
    }

    const stageThree = (
        <div className={styles.form__wrapper}>
            <div className={styles.form__wrapper3}>
                <div className={styles.form__titleWrapper}>
                    {logo}
                    <h3 className={styles.form__title__three}>Pick a Logo</h3>
                </div>
                <input className={styles.form__input} name="image" type="file" accept="image/*" onChange={(e) => uploadImage(e)} />             
                <h3 className={styles.form__title}>Write a short about</h3>
                <input className={styles.form__stageThreeInput} defaultValue={groupInfo.about} name="about" type="text" placeholder="e.g 1920s Pub hosting pub quiz every wednesday" onChange={(e) => inputHandler(e)} onKeyPress={keyContHandler} />             
                <div className={styles.form__buttonWrapper3}>
                    {btns3}
                </div>    
            </div>
        </div>
    )

    if(!stage3Status && groupInfo.about && groupInfo.about.length > 2 && groupInfo.about.length < 31){
        setStage3Status(true)
        setError("")
    } 
    if(stage3Status && groupInfo.about && (groupInfo.about.length < 3 || groupInfo.about.length > 30)){
        setStage3Status(false)
        setError("About must be between 3-30 characters");
    } 

    var form;

    switch(stage){
        case 0:
            form = stageGo
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
        default: 
            form = <div>Error</div>
    }
    

    var goArrow;
    var backArrow;

    if(stage === 0 || (stage === 2 && (groupInfo.name && groupInfo.name.length > 2))){
        goArrow = <div onClick={() => nextStage()} className={`${styles.form__arrow} ${styles.form__arrow__go}`}>
                       <ArrowForwardIosRoundedIcon />
                    </div>
        } else {
            goArrow = <div></div>
        }
    

    if(stage >= 2 ){
        backArrow = <div onClick={() => backStage()} className={`${styles.form__arrow} ${styles.form__arrow__back}`}>
                        <ArrowBackIosRoundedIcon />
                    </div>
        } else {
            backArrow = <div></div>
        }

    return (
        <div className={styles.form__page}>     
            <div className={styles.form__container}>{form}</div>
            <div className={styles.form__errors}>{error}</div>  
        </div>
    )
}

export default GroupCreate;




// {/* <input type="radio" id="charity" name="grouptype" value="Charity" onChange={setGroupInfo} />
// <label for="charity">Charity</label>
// <input type="radio" id="business" name="grouptype" value="Business" onChange={setGroupInfo} />
// <label for="business">Business</label>
// <input type="radio" id="casual" name="grouptype" value="Casual" onChange={setGroupInfo} />
// <label for="casual">Casual</label> */}