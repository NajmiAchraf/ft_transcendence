"use client"
import { useNavContext } from "../(NavbarPages)/context/NavContext";
import { useState, useEffect } from "react";
import { getCookie } from "./errorChecks";
import { whoami } from "./PersonalInfo";
import { useWebSocketContext } from "../context/WebSocketContext";

type InviteProps = {
    isSender : boolean;
    senderId : number;
};
const InvitePopUp = (props: InviteProps) =>{
    const context = useNavContext()
    const wsProvider = useWebSocketContext()
    const [secondsRemaining, setSecondsRemaining] = useState(10);
    const [divHeight, setDivHeight] = useState(100);

    const AcceptInvite = () =>{
        wsProvider.chat.emit("acceptGameInvitation", {profileId : props.senderId})
        context.setisCountDown(false)
    }
    const disableInvitePopUp = async ()=>{
        try {
            const response = await fetch('http://localhost:3001/chatHttp/rejectGameInvitation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getCookie("AccessToken")}`
              },
              body: JSON.stringify({
                profileId: Number(props.senderId),
              }),
            });
            const el = document.querySelector(".invite-popup") as HTMLElement;
                if (el) {
                  el.style.animation = "fadeOut 0.3s forwards"
                  setTimeout(() => { 
                      el.style.animation = "fadeInAnimation 0.5s ease forwards"
                      context.setisCountDown(false)
                  }, 400)
              }
          } catch (error) {
            console.error('Error fetching users', error);
          }
    }

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prevCountdown) =>{
        const newCountdown = prevCountdown - 1;
        setDivHeight((prevHeight) => (newCountdown / 10) * 100);
        return newCountdown;
      })
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (secondsRemaining === 0) {
     disableInvitePopUp()
    }
  }, [secondsRemaining]);
    return(
        <div className="invite-popup">
            <div className="timer">
                <div className="timer-h" style={{ height: `${divHeight}%`}}></div>
                <div className="timer-content">
                    {secondsRemaining}
                    </div>
            </div>
            { props.isSender ? <div>Waiting for the other player to accept...</div> :
            <div className="buttons">
                <button type="button" onClick={AcceptInvite} className="verify-btn">Accept</button>
                <div className="btn-container">
                <button type="button" onClick={disableInvitePopUp} className='cancel-btn'>Reject</button>
                </div>
            </div>
          }
        </div>
    );
}

export default InvitePopUp;