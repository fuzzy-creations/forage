import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/subcomponents/MemberPreview.module.scss';
import { removeMember, removeEventMember, promoteUserMod } from '../../firebase/Firebase';
import DetectClick from '../../tools/DetectClick';

import MoreVertIcon from '@material-ui/icons/MoreVert';


function MemberPreview(props){
    const [showOptions, setShowOptions] = useState(false);
    const [modStatus, setModStatus] = useState("Add mod");


    function remove(){
        if(props.type === "group"){
            removeMember(props.id, props.member.id)
        } else if(props.type === "event"){
            removeEventMember(props.id, props.member.id)
        }
    }


    var modOptions = props.type === "group" ? (
        <li className={styles.menu__list__item} onClick={
            () => setShowOptions(false),
            () => promoteUserMod(props.member.id, props.id).then(res => {
                if(res){setModStatus("Remove mod")}
            })
        }>{modStatus}</li>
    ) : null;

    var menu = showOptions ? (
        <div className={`${styles.menu}`}>
            <ul className={styles.menu__list}>
                <li className={styles.menu__list__item} onClick={
                    () => setShowOptions(false),
                    () => remove()
                }>Remove</li>
               {modOptions}
            </ul>
        </div>
    ) : null;

    var options;
    if(props.options){
        options = (
            <div className={styles.menu__wrapper}>
            <MoreVertIcon onClick={() => setShowOptions(true)} />
                <DetectClick close={setShowOptions}>{menu}</DetectClick>
            </div>
        )
    }

    

    return (
        <div className={styles.container}>
            <div>
            <div className={styles.mainWrapper}>
                <div className={styles.image}><Link to={`/profile/${props.member.id}`}><img src={props.member.avatar} /></Link></div>
                <div className={styles.username}><Link to={`/profile/${props.member.id}`}>{props.member.firstname}</Link></div>
                <div className={styles.location}>{props.member.location}</div>
                {options}
            </div>
            </div>
        </div>
    )
}

export default MemberPreview;