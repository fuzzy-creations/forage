import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/subcomponents/GroupIcon.module.scss';
import { getGroupData } from '../../firebase/Firebase';
import Loader from '../UI/Loader';
import Tooltip from '@material-ui/core/Tooltip';

function GroupIcon(props){
    const [groupData, setGroupData] = useState();

    useEffect(() => {
        async function fetchData(){
            const groupInfo = await getGroupData(props.groupId)
            setGroupData(groupInfo)
        }
        fetchData()
    }, [])
    console.log(props)

    var icon = groupData ? (
        <Link to={`/groups/${groupData.id}`}>
        <Tooltip title={<div style={{fontSize: "1rem"}}>{groupData.name}</div>}>
        <span className={styles.groupWrapper}>
            <div className={styles.imageWrapper}>
                <img src={groupData.logo} />
            </div>
        </span>   
        </Tooltip> 
        </Link>
    ) : (
        <span className={styles.phantom}></span>
    )

        return (
            <>
           {icon}
           </>
    )
}

export default GroupIcon