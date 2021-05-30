import React from 'react';

import SubForage from './SubForage';
import Nagivation from '../UI/Nav/Nagivation';

import styles from '../../sass/root/SubLayout.module.scss';
import Loader from '../UI/Loader';

import { Redirect } from 'react-router';

import { ProfileDataProvider } from '../../contexts/ProfileData.context';
import { MenuOptionsProvider } from '../../contexts/MenuOptions.context';


import LeftMenu from '../UI/LeftMenu';
import MobileNav from '../UI/Nav/MobileNav';
import MobileBottomNav from '../UI/Nav/MobileBottomNav';


function SubLayout(props){

    var root = <Loader />
    if(props.user){
        root = (
            <ProfileDataProvider>
            <MenuOptionsProvider>
                <div className={styles.layout}>
                    <div className={styles.top}>
                        <div className={styles.leftMenu}><LeftMenu /></div>
                        <div className={styles.mobNav}><MobileNav /></div>
                        <div className={styles.nav}><Nagivation /></div>
                    </div>
                    <div className={styles.forage}><SubForage /></div>
                    <div className={styles.mobBottomNav}><MobileBottomNav /></div>
                </div>
            </MenuOptionsProvider>
            </ProfileDataProvider>
        )
    } else {
        return <Redirect to="/login" />
    }
    
    return (
       <>
       {root}
       </>
    )
}

export default SubLayout;