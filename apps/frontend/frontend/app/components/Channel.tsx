import { IonIcon } from '@ionic/react';
import Link from 'next/link';
import * as IonIcons from 'ionicons/icons';
import { useState } from "react";
import { useWebSocketContext } from '../context/WebSocketContext';
type channelprops = {
  id: string,
  image: string,
  name: string,
  members: string,
  isJoined: boolean,
  privacy: string
};
/*useEffect(() =>{
  try {
    // get an instance of this user
    // date_now - instance_date > 30 seconds and instance game in flag is off ? send post request to delete it : do nothing


    //Accept invitation : send event to both users, the event will have the socket id of the sender and reciever
  }
  catch(e)
  {

  }
}, [])*/
const Channel = (props: channelprops) => {
  const [password, setPassword] = useState("")
  const [showPassSection, setShowPassSection] = useState(false)
  const wsProvider = useWebSocketContext()

  const closeUp =() =>{
    const el = document.querySelector(".channel .password-section") as HTMLElement;
    if (el) {
      el.style.animation = "fadeOut 0.3s forwards";
      setTimeout(() => {
        el.style.animation = "animation: fadeInAnimation 1s ease forwards;";
        setShowPassSection(false)
      }, 400);
    }
  }
  const joinChannel = () => {
    if (props.privacy === "protected") {
      wsProvider.chat.emit('joinChannel', { channelId: props.id, password })
      closeUp()
    }
    else
      wsProvider.chat.emit('joinChannel', { channelId: props.id })
  }
  const leaveChannel = () => {
    wsProvider.chat.emit('leaveChannel', { channelId: Number(props.id) })
  }
  return (
    <div className="channel">
      {(showPassSection ?
      <div className="password-section">
        <img src="/password.png"></img>
        <label>A Password is required !</label>
        <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="enter the channel's password" />
      <div className="buttons">
          <button type="button" onClick={joinChannel} className="verify-btn">Accept</button>
          <div className="btn-container">
          <button type="button" onClick={closeUp} className='cancel-btn'>Cancel</button>
          </div>
      </div>
  </div>
        : "")}
      <div className="background">
        <img src={props.image} />
      </div>
      <div className="content">
        <div className="details">
          <h4>{props.name.slice(0, 7)}</h4>
          <h6>{props.members} member</h6>
        </div>
        <div className="buttons">
          {(props.isJoined ? <><button><Link href={`/chat/${props.id}_channel`}>Chat</Link></button> <button onClick={leaveChannel}>Leave</button></> : <button onClick={() => {
            (props.privacy === "protected" ?
              setShowPassSection(true)
              :
              joinChannel()
            )
          }}>Join</button>)
          }
        </div>
      </div>
    </div>
  );
};

export default Channel;