import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../sass/pages/Groups.module.scss';
import { getGroups, queryGroups } from '../../firebase/Firebase';

import { MenuOptionsContext } from '../../contexts/MenuOptions.context';
import GroupPreview from '../subcomponents/GroupPreview';

import GridOn from '@material-ui/icons/GridOn';
import GroupWork from '@material-ui/icons/GroupWork';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import SportsVolleyballIcon from '@material-ui/icons/SportsVolleyball';


function Groups(props){
    const { setMenuOptions, setMenuSettings } = useContext(MenuOptionsContext);
    const [groups, setGroups] = useState([]);
    const [publicGroups, setPublicGroups] = useState([])
    const [allGroups, setAllGroups] = useState([]);
    const [selectPage, setSelectPage] = useState("all");
    const hash = props.location.hash;

    const optionArray = [
        {name: "All", url: <Link to='/groups'><RadioButtonUncheckedIcon /></Link>, mobUrl: <Link to='/groups'>All</Link>, tag: ""}, 
        {name: "Charity", url: <Link to='/groups#charity'><GroupWork /></Link>, mobUrl: <Link to='/groups#charity'>Charity</Link>, tag: "#charity"},
        {name: "Casual", url: <Link to='/groups#casual'><SportsVolleyballIcon /></Link>, mobUrl: <Link to='/groups#casual'>Casual</Link>, tag: "#casual"},
        {name: "Business", url: <Link to='/groups#business'><GridOn /></Link>, mobUrl: <Link to='/groups#business'>Business</Link>, tag: "#business"}
    ]
    useEffect(() => {
        setMenuOptions(optionArray);
        setMenuSettings(null)
    }, [])

    useEffect(() => {
        async function fetchData(){
            const groupData = await getGroups()
            setAllGroups(groupData);
            const openGroups = groupData.filter(group => group.data.privacySettings.hidden === false);
            setPublicGroups(openGroups)
            setGroups(openGroups)
        }
        fetchData();
    }, [])

    useEffect(() => {
        if(!hash && selectPage !== "all" || hash !== `#${selectPage}`){
            switch(hash){
                case "#charity":
                    setSelectPage("charity")
                    break;
                case "#business":
                    setSelectPage("business")
                    break;
                case "#casual":
                    setSelectPage("casual")
                    break;
                default:
                    setSelectPage("all")
            }
        }
    }, [hash])

    useEffect(() => {
        if(selectPage === "all"){
            setGroups(publicGroups)
            } else {
                const filteredGroups = publicGroups.filter(group => {
                return group.data.type === selectPage;
            })
            setGroups(filteredGroups)     
        }
    }, [selectPage])

    

    const groupMap = groups ? groups.map(group => <GroupPreview group={group} />) : null;


    ///////////////////////////////////////////////////////////////////////////////

    function textQueryHandler(e){
        const query = publicGroups.filter(group => {
            const lowerName = group.data.name.toLowerCase();
            const lowerE = e.target.value.toLowerCase()
            return lowerName.includes(lowerE)        
        })
        setGroups(query);
    }

    var typeHeader = selectPage.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

    ////////////////////////////////////////////////////////////////////////////////

    function searchQuery(query){
        if(query.length > 1){
            const queryString = query.toLowerCase();
            const searchArray = allGroups.filter(group => group.data.name.toLowerCase().startsWith(queryString));   
            setGroups(searchArray)
        }
    }

    function searchQueryHandler(e){
        if(e.key === "Enter"){        
            searchQuery(e.target.value)
         }
    }

    ///////////////////////////////////////////////////////////////////////////////


    return (
        <>
        <div className={styles.container}>
            <div className={styles.query}>
                <input className={styles.query__input} type="text" placeholder="Search" onChange={(e) => textQueryHandler(e)} onKeyPress={(e) => searchQueryHandler(e)} />
            </div>
            <div className={styles.container__header}>
                Communities - {typeHeader}
            </div>
            <div className={styles.groupsWrapper}>
            {groupMap}
            </div>
        </div>
        </>
    )
}

export default Groups;