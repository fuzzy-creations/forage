import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/subcomponents/CreatorPreview.module.scss';

function CreatorPreview(props){

    return (
        <div className={styles.container}>
            <Link to={`/profile/${props.creator.id}`}>
            <div className={styles.mainWrapper}>
                <div className={styles.image}><img src={props.creator.avatar} /></div>
                <div className={styles.username}>{props.creator.firstname}</div>
                <div className={styles.location}>{props.creator.location}</div>
                <div className={styles.creator}>Creator</div>
            </div>
            </Link>
        </div>
    )
}

export default CreatorPreview;