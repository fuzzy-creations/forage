import React, { createContext, useState, useEffect } from "react";
import { Redirect } from 'react-router-dom';
import { db, auth, findUsersAdmins, findUsersMods } from '../firebase/Firebase';
import { reverseGeocoder } from '../tools/Geocoder';
import { geoToInfo } from '../tools/LocationHandler';

export const AuthContext = createContext();

export function AuthProvider(props) {
 
    const [user, setUser] = useState();
    const [username, setUsername] = useState();
    const [userAdmin, setUserAdmin] = useState();
    const [userMods, setUserMods] = useState();
    const [emailVerified, setEmailVerified] = useState(false);
    const [location, setLocation] = useState('')
    const [redirect, setRedirect] = useState(false);
    
    useEffect(() => {
        if(username){getLocation()}

        var unlisten = auth.onAuthStateChanged(async (user) => {
            if(user){
                setEmailVerified(user.emailVerified)

                db.collection("groups").where("admin", "==", user.uid).onSnapshot(async (querySnapshot) => {
                      const data = querySnapshot.docs.map(doc => doc.data().id);    
                      if(data.length > 0){
                          setUserAdmin(data)
                      } else {
                          setUserAdmin(null)
                      }
                });

                const mods = await findUsersMods(user.uid)
                setUser(user.uid)
                setUserMods(mods)
                setUsername(user.displayName)              
                } else {
                setUser(null)
                setUserMods(null)
                setUserAdmin(null)
                setUsername(null)
            }
    })
    }, [])

    useEffect(() => {
        getLocation()
    }, [user])

    
    function registerUser({email, password}){
        var status = async () => {
            try {
                await auth.createUserWithEmailAndPassword(email, password).then(user => {
                    //   user.sendSignInLinkToEmail().then(() => {
                    //     console.log("email verification sent to user");
                    //   });
                    })
                return true
            } catch (error) {
                return error.message
            }
        }
        return status();
    }

    function loginUser({email, password}){
        var status = async () => {
            try {
                await auth.signInWithEmailAndPassword(email, password);
                return true
            } catch (error) {
                return error.message
            }
        }
        return status();
    }

    async function signOut(){
        auth.signOut();     
    }

    async function getLocation(){
        return navigator.geolocation.getCurrentPosition(position => {
           var locationInfo = {latitude: position.coords.latitude, longitude: position.coords.longitude};
            setLocation(locationInfo)
            return locationInfo
          });

    }

    async function getAddress(){
        return geoToInfo(location.latitude, location.longitude);
    }

    function getMiles(i) {
        return i*0.000621371192;
   }

    function distance(lat1, lon1, lat2, lon2) {
        var p = 0.017453292519943295;    // Math.PI / 180
        var c = Math.cos;
        var a = 0.5 - c((lat2 - lat1) * p)/2 + 
                c(lat1 * p) * c(lat2 * p) * 
                (1 - c((lon2 - lon1) * p))/2;
        var kms = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        return getMiles(kms * 1000)
      }


    return (
    <AuthContext.Provider value={{ user: user, username: username, userAdmin: userAdmin, userMods, registerUser, loginUser, signOut, getLocation, location, getAddress, distance }}>
        {props.children}
    </AuthContext.Provider>
    );

}

// try {
//     await firebaseApp.auth()
//         .signInWithEmailAndPassword(email, pass)
// } catch (error) {
//     alert(error.toString())
// }

// auth.currentUser.getIdToken(true).then(() => {
                //     user.getIdTokenResult().then(idTokenResult => {
                //         return idTokenResult.claims.groupAdmin ? idTokenResult.claims.groupAdmin : null;  
                
                
                    // function refreshUser(){
    //     var tokey = auth.currentUser.getIdToken(true).then((res) => {
    //         auth.currentUser.getIdTokenResult().then(idTokenResult => {
    //             if(idTokenResult.claims.groupAdmin){
    //                //setUserCred({...userCred, groupAdmin: idTokenResult.claims.groupAdmin})
    //                setUserAdmin(idTokenResult.claims.groupAdmin)
    //             } else {
    //                console.log("no fund")
    //             }
    //         });
    //     }) 
    // }    

        // async function getAddress(locationData){
    //     var addData = await reverseGeocoder(locationData)
    //     var splitData = addData.split(",")
    //     console.log(splitData);
    //     // var split2 = (splitData[1] + splitData[2])
    //     // var split3 = split2.split(" ")
    //     // var finishSplit = (split3[2])
    //     return splitData[splitData.length - 3];
    // }