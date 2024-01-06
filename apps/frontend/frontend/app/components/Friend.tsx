"use client"
import * as IonIcons from 'ionicons/icons';
import Link from 'next/link';
import { IonIcon } from '@ionic/react';
import { useNavContext } from '../(NavbarPages)/context/NavContext';
import { getCookie } from './errorChecks';
type friendprops = {
    id: number,
    image: string,
    name: string,
    status: string
};
const Friend = (props: friendprops) => {
    const context = useNavContext()
    const UserEvent = async (url: string) => {
        try {
          const data = await fetch(`http://localhost:3001/user/${url}`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie("AccessToken")}`
            },
            body: JSON.stringify({ profileId: props.id })
          });
          if (!data.ok)
            throw new Error("Something Went Wrong")
          /*const res = await data.json()*/
          context.setisUpdated(!context.isUpdated)
        } catch (e) {
    
        }
      }
    return (
        <div className={`friend ${(props.status === "self" ? "friend-self" : "")}`}>
            <div className="info">
                <img src={props.image} />
                <h4><Link href={`/profile/${props.id}`}>{props.name}</Link></h4>
            </div>
            <div className="optionbtn">
                {(props.status === "self" ? "":
                    (props.status === "friend" ? <button onClick={() => UserEvent("remove_friend")}>Unfriend</button> : <button onClick={() => UserEvent("send_friend_request")}>Add</button>))}</div>
        </div>
    );
};
export default Friend;