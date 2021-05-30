import React from 'react';
import { withRouter } from 'react-router-dom';

import Forage from './Forage';
import Nagivation from '../UI/Nav/Nagivation';
import SideNav from '../UI/SideNav';
import SideBlock from '../UI/SideBlock';
import LeftMenu from '../UI/LeftMenu';

import styles from '../../sass/root/Layout.module.scss';


import { ProfileDataProvider } from '../../contexts/ProfileData.context';
import { MenuOptionsProvider } from '../../contexts/MenuOptions.context';
import SideBlockNoUser from '../UI/SideBlock/SideBlockNoUser';

import MobileNav from '../UI/Nav/MobileNav';
import MobileBottomNav from '../UI/Nav/MobileBottomNav';


function Layout(props){
    var sideBlock = props.user ? <SideBlock /> : <SideBlockNoUser />;

    return (
        <ProfileDataProvider>
        <MenuOptionsProvider>
        <div className={styles.layout}>
            <div className={styles.top}>
                <div className={styles.leftMenu}><LeftMenu /></div>
                <div className={styles.mobNav}><MobileNav /></div>
                <div className={styles.nav}><Nagivation /></div>
            </div>
            <div className={styles.side}><SideNav /></div>
            <div className={styles.forage}><Forage /></div>
            <div className={styles.block}>{sideBlock}</div>
            <div className={styles.mobBottomNav}><MobileBottomNav /></div>
        </div>
        </MenuOptionsProvider>
        </ProfileDataProvider>
    )
}

export default withRouter(Layout);