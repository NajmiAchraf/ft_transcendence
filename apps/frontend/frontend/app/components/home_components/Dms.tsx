import React from "react";

interface LiveChatProps {
  Message: string;
  Username: string;
  Avatar: string;
  Time: string;
  status: string;
}

function LiveChat({ Avatar, Username, Message, Time }: LiveChatProps) {
  return (
    <div className=" w-full flex space-x-2 place-items-center">
      <img className="w-[49px] z-30 h-[49px] rounded-xl" src={Avatar} />
      <div className="flex w-full gap-y-[15px] place-items-center">
        <div className="flex  flex-col w-[80%]">
          <p className="w-full text-white text-[14px] font-medium font-Montserrat">
            {Username}
          </p>
          <p className="w-full font-sm text-gray-500 text-[10px] font-Montserrat leading-[16px]">
            {Time}
          </p>
          <div className=" font-montserrat text-xs font-light text-[#ffffffcc] leading-[16px] truncate w-[100%]">
            {Message}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveChat;
