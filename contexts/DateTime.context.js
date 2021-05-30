import React, { createContext, useState, useEffect } from "react";
// import { db } from '../firebase/Firebase';
import moment from 'moment';

export const DateTimeContext = createContext();

export function DateTimeProvider(props) {

    const [localDateTime, setLocalDateTime] = useState(moment());
    const [utcDateTime, setUtcDateTime] = useState(moment().utc());
    
    function readableDateTime(){
        var formattedDateTime = {
            date: moment().format('YYYY-MM-DD'), 
            time: moment().format('H:m')
        }
        return formattedDateTime;
    }

    function formatDateTime(datetime){
        var formattedDateTime = {
            date: datetime.format('YYYY-MM-DD'), 
            time: datetime.format('H:m')
        }
        return formattedDateTime;
    }

    function localToUtc(localtime){     
       return moment(localtime, ["YYYY-MM-DD"]).utc().format('YYYY-MM-DD');
    }
    function utcToLocal(utcTime){
        return moment(utcTime, ["YYYY-MM-DD"]).local().format('YYYY-MM-DD');
        //return moment([utcTime]).add(3, 'months').format('YYYY-MM-DD');
    }

    function dateAfter(date){
        return moment(date).isSameOrAfter(localDateTime.format('YYYY-MM-DD')) 
    }
    function dateBefore(date){
        return moment(date).isBefore(localDateTime.format('YYYY-MM-DD')) 
    }

    return (
    <DateTimeContext.Provider value={{ localDateTime, localToUtc, utcToLocal, formatDateTime, dateAfter, dateBefore, readableDateTime }}>
        {props.children}
    </DateTimeContext.Provider>
    );
}
