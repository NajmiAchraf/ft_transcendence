"use client"
import React from "react";

interface LiveChatProps {
  Message: string;
  Username: string;
  Avatar: string;
  Time: string;
  status : string;
}

function LiveChat({ Avatar, Username, Message, Time, status }: LiveChatProps) {
  return (
    <div className=" flex justify-between   w-full relative items-start ">
      <div className="flex gap-x-[15px] ">
        <div className="livechat-img w-[49px] z-30 h-[49px]">
        <img src={Avatar} />
        <div className={`status ${status}`}></div>
        </div>
        <div className="  flex flex-col gap-y-[2px] mt-[5px]">
          <p className="text-white text-xs font-medium font-Montserrat">
            {Username}
          </p>
          <div className=" font-montserrat  text-xs font-light text-[#ffffffcc] leading-[16px] ">
            <p className="max-w-[200px] break-words ">
              {Message}
            </p>
          </div>
        </div>
      </div>
      <div className=" absolute right-0 top-0 font-medium text-white text-[11px] font-Montserrat leading-[16px]">
        {Time}
      </div>
    </div>
  );
}

export default LiveChat;
