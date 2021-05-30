import React from 'react';
import styles from '../../sass/subcomponents/GroupPreview.module.scss';
import { Link } from 'react-router-dom';


function GroupPreview(props){

    // var url = props.group.data.logo
    var url = props.group.data.logo;
    var bgGrad = {"background-image": `url(${url})`}

    console.log(props)

    const members = props.group.data.members.length;

    return (
        <>
        <div className={styles.groupTile}>
        <Link to={`/groups/${props.group.id}`}>
            <div className={styles.groupTile__wrapper}>
                <div className={styles.groupTile__wrapper__image} style={bgGrad}></div>
                <div className={styles.groupTile__wrapper__header}>{props.group.data.name}</div>
                <div className={styles.groupTile__wrapper__para}>{props.group.data.about}</div>
                <div className={styles.groupTile__wrapper__footer}><span>{props.group.data.location}</span><span>{`${members} Members`}</span></div>
            </div>
            </Link>
        </div>
        </>
    )

}

export default GroupPreview;

























