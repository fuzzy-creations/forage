import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/subcomponents/MemberIcon.module.scss';
import { getUserData } from '../../firebase/Firebase';
import Loader from '../UI/Loader';

function MembersTile(props){

        console.log(props)
        return (
            <Link to={`/profile/${props.user.id}`}>
            <span className={styles.memberWrapper}>
                <div className={styles.imageWrapper}>
                    <img src={props.user.avatar} />
                </div>
                <div className={styles.nameWrapper}>{props.user.firstname}</div>
            </span>    
            </Link>
    )
}

export default MembersTile

{/* <img src={props.person.avatar} />
 <Link to={`/profile/${props.person.id}`}>{props.person.name}</Link> */}