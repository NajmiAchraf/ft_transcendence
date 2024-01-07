"use client"
import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useWebSocketContext } from "@/app/context/WebSocketContext";

interface FriendListProps {
  getFriendList : () => Promise<void>;
  getMembers : () => Promise<void>;
  Id: number;
  Username: string;
  Avatar: string;
  Status: string;
  isInvite: boolean;
}

function FriendList({
  getMembers,
  getFriendList,
  Id,
  Username,
  Avatar,
  Status,
  isInvite,
}: FriendListProps) {
  const urlParams = useParams();
  const wsProvider = useWebSocketContext();
  const router = useRouter();
  const InviteToChannel = async (_profileId: number) => {
    console.log(_profileId)
    const _channelId: string = (urlParams.conversationId as string).slice(0, -("_channel").length);
    console.log(_profileId, _channelId)
    wsProvider.chat.emit("addChannelMember", { profileId: _profileId, channelId: Number(_channelId) })
    setTimeout(() => { getMembers(); getFriendList() }, 100)
}
  return (
    <div className=" flex justify-between  items-center">
      <div className="flex items-center gap-[15px] ">
        <img className="w-[43px] z-30 h-[43px] rounded-xl" src={Avatar} />
        <div className="flex flex-col gap-y-[2px] ">
          <p className="text-white text-xs font-medium font-Montserrat">
            <Link href={`/profile/${Id}`}>{Username}</Link>
          </p>
          <div className={`${Status === "online" ? "text-green-500" : (Status === "offline" ? "text-gray-500" : "text-red-500")} font-montserrat text-xs font-normal leading-4`}>


            
            {Status}
          </div>
        </div>
      </div>
      {isInvite ? (
        <button
          onClick={async () => await InviteToChannel(Id)}
          className=" relative w-10 h-8 flex place-content-center items-center rounded-md [background:linear-gradient(180deg,rgba(215,84,51,0.75)_0%,rgba(88.9,32.98,202.94,0.75)_100%)]"
        >
          
         {/* <PlusIcon className="h-6 w-6 text-gray-500" /> */}
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>


        </button>
      ) : (
        <div className="flex justify-between gap-[10px] items-center ">
          <button
            onClick={() => {
              router.push(`/chat/${Id}`);
            }}
            className=" relative w-10 h-8 flex-shrink-0 rounded-md [background:linear-gradient(180deg,rgba(215,84,51,0.75)_0%,rgba(88.9,32.98,202.94,0.75)_100%)]"
          >
            <svg
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="15"
              viewBox="0 0 16 15"
              fill="none"
            >
              <path
                d="M11.9512 0C13.024 0 14.056 0.441667 14.8152 1.23417C15.5752 2.025 16 3.09167 16 4.20833V10.7917C16 13.1167 14.184 15 11.9512 15H4.048C1.8152 15 0 13.1167 0 10.7917V4.20833C0 1.88333 1.8072 0 4.048 0H11.9512ZM12.856 4.33333C12.688 4.32417 12.528 4.38333 12.4072 4.5L8.8 7.5C8.336 7.90083 7.6712 7.90083 7.2 7.5L3.6 4.5C3.3512 4.30833 3.0072 4.33333 2.8 4.55833C2.584 4.78333 2.56 5.14167 2.7432 5.39167L2.848 5.5L6.488 8.45833C6.936 8.825 7.4792 9.025 8.048 9.025C8.6152 9.025 9.168 8.825 9.6152 8.45833L13.224 5.45L13.288 5.38333C13.4792 5.14167 13.4792 4.79167 13.2792 4.55C13.168 4.42583 13.0152 4.35 12.856 4.33333Z"
                fill="white"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              wsProvider.chat.emit("sendGameInvitation", { profileId: Id });
            }}
            className=" relative w-10 h-8 flex-shrink-0 rounded-md [background:linear-gradient(180deg,rgba(215,84,51,0.75)_0%,rgba(88.9,32.98,202.94,0.75)_100%)]"
          >
            <svg
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M5.08734 0C5.41708 0 5.67615 0.262042 5.67615 0.578035C5.67615 0.809249 5.87242 0.99422 6.10795 0.99422H6.88518C8.07066 1.00193 9.03631 1.9499 9.04416 3.10597V3.25241C9.78999 3.25241 10.5358 3.26782 11.2895 3.27553C14.0137 3.27553 16 5.21773 16 7.89981V11.3449C16 14.027 14.0137 15.9692 11.2895 15.9692C10.1982 15.9923 9.10697 16 8.00785 16C6.90873 16 5.80177 15.9923 4.7105 15.9692C1.98626 15.9692 0 14.027 0 11.3449V7.89981C0 5.21773 1.98626 3.27553 4.71835 3.27553C5.74681 3.26012 6.79882 3.2447 7.86654 3.2447V3.11368C7.86654 2.58189 7.41904 2.15029 6.88518 2.15029H6.10795C5.2208 2.15029 4.49853 1.44123 4.49853 0.578035C4.49853 0.262042 4.76546 0 5.08734 0ZM5.6683 7.65318C5.33857 7.65318 5.07949 7.91522 5.07949 8.23121V9.04046H4.2473C3.92542 9.04046 3.65849 9.30251 3.65849 9.6185C3.65849 9.9422 3.92542 10.1965 4.2473 10.1965H5.07949V11.0135C5.07949 11.3295 5.33857 11.5915 5.6683 11.5915C5.99019 11.5915 6.25711 11.3295 6.25711 11.0135V10.1965H7.08145C7.40334 10.1965 7.67027 9.9422 7.67027 9.6185C7.67027 9.30251 7.40334 9.04046 7.08145 9.04046H6.25711V8.23121C6.25711 7.91522 5.99019 7.65318 5.6683 7.65318ZM11.8391 10.3892H11.7605C11.43 10.3892 11.1717 10.6513 11.1717 10.9672C11.1717 11.2909 11.43 11.5453 11.7605 11.5453H11.8391C12.1609 11.5453 12.4279 11.2909 12.4279 10.9672C12.4279 10.6513 12.1609 10.3892 11.8391 10.3892ZM10.4966 7.73796H10.4181C10.0883 7.73796 9.82924 8 9.82924 8.31599C9.82924 8.63969 10.0883 8.89403 10.4181 8.89403H10.4966C10.8184 8.89403 11.0854 8.63969 11.0854 8.31599C11.0854 8 10.8184 7.73796 10.4966 7.73796Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default FriendList;
