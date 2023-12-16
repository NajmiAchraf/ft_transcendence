import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import GlobalMessage from './GlobalMessage';
import { useState, useEffect, FormEvent } from 'react';
import { useWebSocketContext } from '../context/WebSocketContext';
import { getCookie } from './errorChecks';
import { formatTimeDifference } from './errorChecks';
type MessageType = {
  sender_id: number;
  nickname: string;
  message_text: string;
  avatar: string;
  status: string;
  created_at: string;
};

const GlobalChat = ({ userId }: { userId: number }) => {

  const wsProvider = useWebSocketContext()
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [timeDifferences, setTimeDifferences] = useState<string[]>([]);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  useEffect(() => {
    const el = document.querySelector(".btn button")
    if (el) {
      el.classList.remove("non-active-btn")
      if (inputValue.trim() === '')
        el.classList.add("non-active-btn")
    }
  }, [inputValue])
  useEffect(() => {
    // Function to calculate time difference
    const calculateTimeDifferences = () => {
      const newTimeDifferences = messages.map((msg) => formatTimeDifference(new Date(msg.created_at)));
      setTimeDifferences(newTimeDifferences);
    };

    // Initial calculation
    calculateTimeDifferences();

    // Set up an interval to update time differences every minute (adjust as needed)
    const intervalId = setInterval(calculateTimeDifferences, 60000);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [messages]);

  useEffect(() => {
    const getAllGlobalChat = async () => {
      try {
        const data = await fetch('http://localhost:3001/chatHttp/findAllGlobalChat', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getCookie("AccessToken")}`,
          }
        });
        if (!data.ok)
          throw new Error("WTF");
        const res = await data.json();
        console.log("RESULTS :", res)
        setMessages(messages.concat(res))
        console.log("1")
        /*await   res.forEach((msg : MessageType, key : number) =>{
          console.log(key)
          /*setMessages([...messages, msg]);
          setMessages((prevMessages) => [...prevMessages, msg]);
        })*/
      }
      catch (e) {
        console.log(e)
      }
      /*data.forEach((message) => {
        const chatDiv = document.getElementById('chat');
        chatDiv.innerHTML += `<p>[id: ${message.sender_id}, nickname: ${message.nickname}] ${message.message_text} : ${message.create_at}</p>`;
      });*/
    }
    getAllGlobalChat()
  }, []);

  useEffect(() => {
    wsProvider.chat.on("createChat", (event) => {
      console.log("LOLOLOLOLOL")
      console.log(event)
      /*const data = JSON.parse(event.data);*/
      setMessages((prevMessages) => [event, ...prevMessages]);
    })
  }, []) 

  const submitMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      wsProvider.chat.emit("GlobalCreate", inputValue)
      setInputValue("")
    }
  }
  useEffect(() => {
    const el: HTMLElement | null = document.querySelector(".messages")
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length])
  return (
    <div className="pf-section global-chat">
      <h3>Live chat</h3>
      <div className="messages">
        {messages.slice().reverse().map((msg, index) => (
          <GlobalMessage key={`"${index}"`} id={msg.sender_id} image={msg.avatar} name={msg.nickname} text={msg.message_text} time={timeDifferences[timeDifferences.length - index - 1]} status={msg.status} />
        ))}
      </div>
      <form onSubmit={submitMessage} className="text-input">
        <input type="text" placeholder='send message' value={inputValue} onChange={handleInputChange} />
        <div className="btn"><button className="non-active-btn" type="submit"><IonIcon icon={IonIcons.send} /></button></div>
      </form>
    </div>
  );
}
export default GlobalChat;