"use client"
import React from "react";
import {
  Drawer,
  Button,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import LiveChat from "../home_components/LiveChat";
import { useState, useEffect, FormEvent } from 'react';
import { formatTimeDifference } from "@/app/components/errorChecks";
import { useWebSocketContext } from '@/app/context/WebSocketContext';
import { getCookie } from "@/app/components/errorChecks";
type MessageType = {
  sender_id: number;
  nickname: string;
  message_text: string;
  avatar: string;
  status: string;
  created_at: string;
};

function DrawerLiveChat() {
  const wsProvider = useWebSocketContext()
  const [openRight, setOpenRight] = React.useState(false);
  const openDrawerRight = () => setOpenRight(true);
  const closeDrawerRight = () => setOpenRight(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');

  const [timeDifferences, setTimeDifferences] = useState<string[]>([]);
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
        setMessages(messages.concat(res))
      }
      catch (e) {
        console.log(e)
      }
    }
    getAllGlobalChat()
  }, []);

  useEffect(() => {
    const el = document.querySelector("#submitmessagebtn")
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
    wsProvider.chat.on("createChat", (event) => {
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

  return (
    <div className="">
      <React.Fragment>
        <button
          onClick={openDrawerRight}
          className="   flex items-center text-gray-500 hover:text-gray-700 focus:outline-none justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
          >
            <path
              d="M18.8299 2.49238C18.7739 2.84238 18.7459 3.19237 18.7459 3.54237C18.7459 6.69232 21.2939 9.23888 24.4299 9.23888C24.7799 9.23888 25.1159 9.19828 25.4659 9.14228V20.4387C25.4659 25.186 22.6659 28 17.9059 28H7.56136C2.79999 28 0 25.186 0 20.4387V10.0803C0 5.32034 2.79999 2.49238 7.56136 2.49238H18.8299ZM19.1113 11.0043C18.7319 10.9623 18.3553 11.1303 18.1299 11.4382L14.7433 15.8202L10.8639 12.7682C10.6259 12.5862 10.3459 12.5148 10.066 12.5442C9.78735 12.5862 9.53535 12.7388 9.36595 12.9628L5.22337 18.3541L5.13797 18.4801C4.89998 18.9267 5.01198 19.5007 5.43197 19.8101C5.62797 19.9361 5.83797 20.0201 6.07597 20.0201C6.39937 20.0341 6.70597 19.8647 6.90197 19.6001L10.4159 15.0768L14.4059 18.0741L14.5319 18.1567C14.9799 18.3947 15.5399 18.2841 15.8619 17.8628L19.9079 12.6422L19.8519 12.6702C20.0759 12.3622 20.1179 11.9702 19.9639 11.6202C19.8113 11.2703 19.4739 11.0323 19.1113 11.0043ZM24.626 0C26.488 0 28 1.51198 28 3.37395C28 5.23592 26.488 6.7479 24.626 6.7479C22.764 6.7479 21.252 5.23592 21.252 3.37395C21.252 1.51198 22.764 0 24.626 0Z"
              fill="#8F8F8F"
            />
          </svg>
        </button>
        <div className="drawer-fix">
          <Drawer
            placeholder = "live-chat"
            placement="right"
            open={openRight}
            size={400}
            className="z-50 p-3 bg-slate bg-[#1A1C26] !h-[100%]"
          >
            {/* <div className="flex flex-col justify-center items-center"> */}
            <button>
              <XMarkIcon className="h-6 w-6" onClick={closeDrawerRight} />
            </button>
            <div className="  bg-[#272932] rounded-[20px] px-[25px]">
            <div className="font-extrabold text-white text-[12px] pt-[25px] pb-[13px] font-Ethnocentric leading-[38px]">
              LIVE CHAT
            </div>
            <div id="scrollable-div" className="h-[50vh] mb-6 space-y-[22px] no-scrollbar overflow-y-scroll">
              {messages.slice().reverse().map((message, index) => (
                <LiveChat
                  key={index}
                  Username={message.nickname}
                  Avatar={message.avatar}
                  Message={message.message_text}
                  Time={timeDifferences[timeDifferences.length - index - 1]}
                  status={message.status}
                />
              ))}
            </div>
            <form onSubmit={submitMessage} className="flex justify-between bottom-0">
              <div className="w-full h-[45px] relative mb-2">
                <input value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  className=" w-full h-full mb-2 rounded-xl border-none font-normal text-[#8f8f8f] px-[20px] py-2 text-[12px] bg-[#1A1C26] focus:outline-none focus:ring-2 focus:ring-[#D75433]"
                  type="text"
                  placeholder="Send Message"
                />
                <button type="submit" id="submitmessagebtn" className="duration-500 absolute right-[10px]  mt-[8px] w-[32px] h-[30px] rounded-md [background:linear-gradient(180deg,rgba(215,84,51,0.75)_0%,rgba(88.9,32.98,202.94,0.75)_100%)]">
                  <svg
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 17 17"
                    fill="none"
                  >
                    <path
                      d="M16.1792 8.97961C16.1986 8.55938 15.9836 8.16549 15.6205 7.95048L7.15881 2.93131C6.78 2.70043 6.3241 2.71222 5.95219 2.94859C5.57346 3.18892 5.36405 3.78387 5.45327 4.22151L6.1466 7.61865C6.21779 7.96701 6.51909 8.22058 6.87502 8.23079L11.6713 8.37411C11.9171 8.37729 12.1097 8.58303 12.0967 8.82845C12.0879 9.06984 11.8852 9.25961 11.6395 9.25643L6.83873 9.10923C6.48284 9.09818 6.16392 9.33238 6.06777 9.67574L5.12318 13.0323C5.00886 13.4288 5.11099 13.8319 5.38384 14.1233C5.41594 14.1576 5.45206 14.1962 5.48847 14.2264C5.84458 14.5204 6.32194 14.5722 6.7377 14.3679L15.5395 9.96459C15.917 9.78005 16.1599 9.39984 16.1792 8.97961Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          </Drawer>
          </div>
      </React.Fragment>
    </div>
  );
}

export default DrawerLiveChat;
