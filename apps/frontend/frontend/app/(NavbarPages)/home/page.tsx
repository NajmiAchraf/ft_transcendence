"use client"
import { Span } from "next/dist/trace";
import HomeCard from "../../components/home_components/HomeCard";
import RecentMatches from "../../components/home_components/RecentMatches";
import FriendList from "../../components/home_components/FriendList";
import LiveChat from "../../components/home_components/LiveChat";
import { getCookie } from "@/app/components/errorChecks";
import { whoami } from "@/app/components/PersonalInfo";
import { fetchServerResponse } from "next/dist/client/components/router-reducer/fetch-server-response";
import { useState, useEffect, FormEvent } from 'react';
import { useWebSocketContext } from '@/app/context/WebSocketContext';
import { formatTimeDifference } from "@/app/components/errorChecks";
import { useNavContext } from "../context/NavContext";
type MessageType = {
  sender_id: number;
  nickname: string;
  message_text: string;
  avatar: string;
  status: string;
  created_at: string;
};

type FriendsType = {
    id: number;
    nickname: string;
    avatar: string;
    status: string;
}
type PlayerType = {
    id: number;
    nickname: string;
    avatar: string;
    points: string;
}
type MatchType = {
    winner: PlayerType;
    loser: PlayerType;
    startedAt: string;
} 
export default function Home() {
  const wsProvider = useWebSocketContext()
  const context = useNavContext()
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [timeDifferences, setTimeDifferences] = useState<string[]>([]);
  useEffect(
    () => {
        context.setNav("0");
    }
    , []);

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
    const getAllGlobalChat = async () => {
      try {
        const data = await fetch(`${process.env.API_URL}/chatHttp/findAllGlobalChat`, {
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
  useEffect(() => {
    const el: HTMLElement | null = document.querySelector("#scrollable-div")
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length])

  const card1Title = "Friends & Foes";
  const card1Description =
    "Engage in the ultimate ping pong duel against your friends and rivals.";
  const card1ImageUrl = "bg-[url('/uuu.jpg')]";

  const card2Title = "Machine Duel";
  const card2Description =
    "Go head-to-head against the computer for an exciting ping pong solo challenge.";
  const card2ImageUrl = "bg-[url('/robot.png')]";

    const [FriendListData, setFriendListData] = useState<FriendsType[]>([]);
    const [recentMatchesData, setRecentMatchesData] = useState<MatchType[]>([]);
    const fetchFriendList = async () => {
      try {
        const res = await fetch(`${process.env.API_URL}/home/friends_list`, {
          headers: {
            Authorization: `Bearer ${getCookie("AccessToken")}`,
          },
        });
        const data = await res.json();
        setFriendListData(data);
        console.log(data)
      } catch (e) {
        console.log(e);
      }
    };
    useEffect(() => {
    fetchFriendList()
  }, []);
  
  useEffect(() => {
    const fetchRecentMatches = async () => {
      try {
        const res = await fetch(`${process.env.API_URL}/home/recent_4_matches`, {
          headers: {
            Authorization: `Bearer ${getCookie("AccessToken")}`,
          },
        });
        const data = await res.json();
        // console.log("HAAAAAAAAAAAAAAAAA")
        setRecentMatchesData(data);
        console.log(data)
      } catch (e) {
        console.log(e);
      }
    };
    fetchRecentMatches()
  }, []);
  return (
    <div className="fadeInSection home-container gap-[30px] flex flex-col md:grid lg:grid-cols-3">
      <div className=" col-span-2  ">
        <div className=" flex flex-col md:grid sm:grid-rows-3 h-full md:h-[86vh] gap-[20px] ">
          <div className="  w-full h-[300px] md:h-full relative ">
            <img
              src="/evvvv.png"
              alt=" Description card"
              className="filter brightness-[0.3] object-cover w-full h-full rounded-[20px] bg-gradient-to-b from-red-400 to-violet-800 rounded-[20px] mix-blend-overlay "
            />
            <h2 className=" text-gray-400 home-front-text font-Ethnocentric w-[72%] absolute top-[36%] text-[1.5rem] left-[6px]">Play, Compete, and Conquer in the Ultimate <span className="text-red-600">Pong</span> Experience</h2>
            <img 
              src="/hya3.png"
              alt=" Description card"
              className=" hidden absolute bottom-0 right-0 w-[240px] h-[340px] home-image"
            />
          </div>
          <div className=" w-full h-full grid sm:grid-cols-2 gap-[30px]">
            <HomeCard
              title={card1Title}
              description={card1Description}
              imgUrl={card1ImageUrl}
              modeCheck={true}
            />
            <HomeCard
              title={card2Title}
              description={card2Description}
              imgUrl={card2ImageUrl}
              modeCheck={false}
            />
          </div>
          <div className=" relative w-full h-full ">
            <div className=" mb-1 font-black text-[16px] font-Ethnocentric mx-1">
              <span className="text-[#987EE4]">RECENT</span> MATCHES
            </div>
            {recentMatchesData.length > 0 ? (
            <div className="w-full h-[50%] grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              {recentMatchesData.map((match, index) => (
                <RecentMatches key={index} winner={match.winner} loser={match.loser} startedAt={match.startedAt}
                />
              ))}
            </div>) : (
            <p className="p-10 text-center text-white/80 text-xl font-bold font-Montserrat leading-[40.80px] break-words">No Matches ever Played <br/>Take the Lead and Be the First 💪</p>)}
          </div>
        </div>
      </div>

      <div className="livechat lg:grid grid-rows-2 h-[86vh] gap-[23px] hidden">
        <div className=" bg-[#272932] rounded-[20px] px-[25px]">
          <div className="font-extrabold text-white text-[12px] pt-[20px] pb-[13px] font-Ethnocentric leading-[38px] ">
            FRIEND LIST
          </div>
          <div className=" relative h-[78%] py-2  no-scrollbar overflow-auto space-y-[14px]">
            {(!FriendListData.length ? <p className="text-center text-white text-md font-bold font-['Montserrat'] leading-[40.80px] break-words absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%]">Hi There 👋  <br/>You still have no Friends.</p> :
            FriendListData.map((user, index) => (
              <FriendList
                getMembers={async () => {}}
                getFriendList={async () => {}}
                key={index}
                Id={user.id}
                Username={user.nickname}
                Avatar={user.avatar}
                Status={user.status}
                isInvite={false}
              />
            )))}
          </div>
        </div>
        <div className="  bg-[#272932] rounded-[20px] overflow-auto px-[25px]">
          <div className="font-extrabold text-white text-[12px] pt-[25px] pb-[13px] font-Ethnocentric leading-[38px]">
            LIVE CHAT
          </div>
          <div id="scrollable-div" className=" mb-6 space-y-[22px] h-[55%] no-scrollbar overflow-auto">
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
          <form onSubmit={submitMessage} className="flex justify-between">
            <div className="  w-full h-[45px] relative">
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
      </div>
    </div>
  );
}
