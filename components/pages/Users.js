import React, { useState, useEffect } from 'react'
import { getUsers } from '../../firebase/Firebase';
import styles from '../../sass/pages/Users.module.scss';

function Users(){
    const [userCollection, setUserCollection] = useState([]);
    const [usersDisplay, setUsersDisplay] = useState([])

    useEffect(() => {
        async function fetchData(){
            const allUsers = await getUsers()
            setUserCollection(allUsers);
            setUsersDisplay(allUsers);
        }
        fetchData()
    }, []) 

    function textQueryHandler(e){
        const query = userCollection.filter(user => {
            const lowerName = user.firstname.toLowerCase() + " " + user.surname.toLowerCase();
            const lowerE = e.target.value.toLowerCase()
            return lowerName.includes(lowerE)        
        })
        setUsersDisplay(query);
    }

    var usersMap = usersDisplay ? usersDisplay.map(user => <div>{user.firstname}</div>) : null

    return (
        <div className={styles.container}>
            <div className={styles.query}>
                <input className={styles.query__input} type="text" placeholder="Search" onChange={(e) => textQueryHandler(e)} />
            </div>
            <div className={styles.container__header}>Users</div>
            <div className={styles.list}>
                {usersMap}
            </div>
        </div>
    )
}

export default Users;