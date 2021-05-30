import React, { createContext, useState } from "react";

export const MenuOptionsContext = createContext();

export function MenuOptionsProvider(props){
    const [options, setOptions] = useState();
    const [settings, setSettings] = useState();

    console.log("menu context")

    return (
        <MenuOptionsContext.Provider value={{menuList: options, menuSettings: settings, setMenuOptions: setOptions, setMenuSettings: setSettings}}>
            {props.children}
        </MenuOptionsContext.Provider>
        );
}