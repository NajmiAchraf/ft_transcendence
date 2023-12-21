import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { getCookie } from './errorChecks';
import { TokenRefresher } from './errorChecks';
import { useEffect, useState, useRef } from 'react';
import { useNavContext } from '../(NavbarPages)/context/NavContext';
import Link from 'next/link';
export async function whoami() {
  try {
    const data = await fetch("http://localhost:3001/home/whoami", {
      headers: {
        Authorization: `Bearer ${getCookie("AccessToken")}`
      }
    });

    if (!data.ok) {
      throw new Error("Failed to fetch data");
    }

    const res = await data.json();
    return res;
    console.log("User id ", res)
    //setfriendList(friendListinfo)
  } catch (error) {
    console.error("Error fetching data:", error);
    return undefined;
    //TokenRefresher();
  }
}
const PersonalInfo = ({ userId, setisAllowed }: { userId: number, setisAllowed: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const context = useNavContext()
  const [isDivVisible, setDivVisible] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click occurred outside of the button and the div
      if (
        event.target instanceof Element &&
        event.target.id !== 'toggleButton'
      ) {
        setDivVisible(false);
      }
    };

    // Add global click event listener
    document.addEventListener('click', handleClickOutside);

    return () => {
      // Remove the event listener when the component unmounts
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const [userData, setUserData] = useState<{ personalInfo: any; otherData: any } | null>(null);
  const UserEvent = async (url: string) => {
    try {
      const data = await fetch(`http://localhost:3001/user/${url}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie("AccessToken")}`
        },
        body: JSON.stringify({ profileId: userId })
      });
      if (!data.ok)
        throw new Error("Something Went Wrong")
      /*const res = await data.json()*/
      context.setisUpdated(!context.isUpdated)
    } catch (e) {

    }
  }

  const FriendRequest = async (friendRequestResponse: string) => {
    console.log(String(userId), " : ", friendRequestResponse)
    console.log(typeof String(userId), " : ", typeof friendRequestResponse)
    try {
      const data = await fetch(`http://localhost:3001/user/respond_to_friend_request`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie("AccessToken")}`
        },
        body: JSON.stringify({ profileId: String(userId), friendRequestResponse })
      });
      if (!data.ok)
        throw new Error("Something Went Wrong")
      /*const res = await data.json()*/
      context.setisUpdated(!context.isUpdated)
    } catch (e) {
      console.log("Error : ", e)
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch("http://localhost:3001/user/pf_infos", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie("AccessToken")}`
          },
          body: JSON.stringify({ profileId: userId })
        });

        if (!data.ok) {
        }

        const personalInfoResult = await data.json();
        const data2 = await fetch("http://localhost:3001/user/personal_infos", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie("AccessToken")}`
          },
          body: JSON.stringify({ profileId: userId })
        });

        if (!data2.ok) {
          if (data.status === 403 || data.status === 500) {
            console.error("user is blocked")
            setisAllowed(false)
            return (null)
          }
          throw new Error("Failed to fetch data");
        }
        const otherDataResult = await data2.json()
        setUserData({
          personalInfo: personalInfoResult,
          otherData: otherDataResult,
        });
        console.log(userData)
      } catch (error) {
        console.error("dgbError fetching data:", error);
        /*TokenRefresher();*/
      }
    };

    fetchData();
  }, [userId, context.isUpdated]);
  console.log(userData)
  if (!userData || !userData.personalInfo || !userData.otherData) {
    return null;
  }
  return (
    <div className="pf-section pf">
      <div className="background">
      </div>
      <div className="p-info">
        <div className="sec-1">
          <div className="p-info-sec">
            <h6>Total Games</h6>
            <h4>{userData.personalInfo.totalGames}</h4>
          </div>
          <div className="p-info-sec">
            <h6>Win</h6>
            <h4>{(userData.personalInfo.winPercentage ? Math.floor(userData.personalInfo.winPercentage) : "0")}%</h4>
          </div>
          <div className="p-info-sec">
            <h6>Loss</h6>
            <h4>{(userData.personalInfo.lossPercentage ? Math.floor(userData.personalInfo.lossPercentage) : "0")}%</h4>
          </div>
        </div>
        <div className="player-image">
          <img src={userData.otherData.avatar} />
          <h4 className="username">{userData.otherData.username} {(userData.otherData.status !== "blocked" && userData.otherData.status !== "self" ?
            <div className="options-section">
              <IonIcon id="toggleButton" onClick={() => { setDivVisible(!isDivVisible) }} icon={IonIcons.ellipsisHorizontal}></IonIcon>
              {(isDivVisible &&
                <div className="user-options">
                  <div className="option"><div onClick={() => UserEvent("block_user")} className="option-content"><IonIcon icon={IonIcons.removeCircle}></IonIcon> Block</div></div>
                  {userData.otherData.status === "friend" &&
                    <div className="option"><div onClick={() => UserEvent("remove_friend")} className="option-content"><IonIcon icon={IonIcons.closeCircle}></IonIcon> Unfriend</div></div>}
                </div>)}
            </div>
            : "")}</h4>
          <h6>@{userData.otherData.nickname}</h6>
        </div>
        <div className="sec-2">
          <div className="p-info-sec">
            <h6>Points Scored</h6>
            <h4>{userData.personalInfo.totalScore}</h4>
          </div>
          <div className="p-info-sec">
            <h6>Highest Score</h6>
            <h4>{userData.personalInfo.highestScore}</h4>
          </div>
        </div>
      </div>
      <div className="buttonpart">
        {(userData.otherData.status === "stranger" ? <button onClick={() => UserEvent("send_friend_request")} className="addbtn"><IonIcon icon={IonIcons.add} /> add</button> : (
          userData.otherData.status === "friend" ? <Link href={`/chat/${userId}`}><button className="addbtn"><IonIcon icon={IonIcons.chatbubble} /> message</button></Link> : (
            userData.otherData.status === "blocked" ? <button onClick={() => UserEvent("unblock_user")} className="addbtn"><IonIcon icon={IonIcons.lockOpen} /> unblock</button> : (
              (userData.otherData.status === "request_sent" ? <button onClick={() => UserEvent("cancel_friend_request")} className="addbtn"><IonIcon icon={IonIcons.close} /> Remove request</button> : (
                userData.otherData.status === "request_received" ? <><button onClick={() => FriendRequest("accept")} className="addbtn"><IonIcon icon={IonIcons.checkmark} /> Accept</button>
                  <button onClick={() => FriendRequest("reject")} className="addbtn"><IonIcon icon={IonIcons.close} /> Reject</button></> :
                  ""
              )) //request_received
            ))))}
      </div>
      <div className="levelpart">
        <div className="level"><h5>Level {(userData.personalInfo.Level ? userData.personalInfo.Level : "0")}</h5> <div className="bar"><div style={{ width: `${(userData.personalInfo.LevelPercentage ? userData.personalInfo.LevelPercentage : "0")}%` }} className="bar-fill"></div><h5>{((userData.personalInfo.LevelPercentage ? userData.personalInfo.LevelPercentage : "0"))}%</h5></div></div>
      </div>
    </div>
  );
}
export default PersonalInfo;