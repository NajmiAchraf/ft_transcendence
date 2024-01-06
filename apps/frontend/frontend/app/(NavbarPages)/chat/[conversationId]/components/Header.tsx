"use client";
import React from "react";
import Avatar from "@/app/components/chat_components/Avatar";
import { useMemo, useState } from "react";
import FriendList from "@/app/components/home_components/FriendList";
import Link from "next/link";
import { getCookie } from "@/app/components/errorChecks";
import { useParams } from "next/navigation";
import { useWebSocketContext } from "@/app/context/WebSocketContext";
import AvatarGroup from "@/app/components/chat_components/AvatarGroup";
type FriendsType = {
  id: number;
  nickname: string;
  avatar: string;
  status: string;
};
const Header = ({ isChannelProtected, getMembers, conversation, secondId }: any) => {
  const [isActive] = useState(false);
  const [isGroup] = useState(true);
  const [FriendListData, setFriendListData] = useState<FriendsType[]>([]);
  const urlParams = useParams();
  const wsProvider = useWebSocketContext();
  const leaveChannel = async () => {
    const Id: string = (urlParams.conversationId as string).slice(0, -("_channel").length);
    wsProvider.chat.emit("leaveChannel", { channelId: Number(Id) })
  }
  const fetchFriendList = async () => {
    try {
      const Id = (urlParams.conversationId as string).slice(
        0,
        -"_channel".length
      );
      const res = await fetch(
        `${process.env.API_URL}/chatHttp/inviteToChannelList`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("AccessToken")}`,
          },
          body: JSON.stringify({ channelId: Number(Id) }),
        }
      );
      const data = await res.json();
      setFriendListData(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      className="
      bg-[#272932]
      w-full
      h-[10%]
      flex
      sm:px-4
      py-3
      px-4
      lg:px-6
      justify-between
      items-center
      shadow-sm
      "
    >
      <div className="flex  gap-3 items-center">
        <Avatar img={conversation?.avatar} status={conversation?.status} />
        <div className="flex flex-col">
          {(!secondId.endsWith("_channel") ?
          <Link href={`/profile/${secondId}`}>{conversation?.nickname}</Link>
          : <div>{conversation?.nickname}</div>)}
          <div className="text-sm font-light text-neutral-500">
            {conversation?.status}
          </div>
        </div>
      </div>
      {(urlParams.conversationId as string).endsWith("_channel") &&
      isChannelProtected ? (
        ""
      ) : (
        <>
          <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if ((urlParams.conversationId as string).endsWith("_channel"))
              {
                await fetchFriendList();
                const el: any | null = document.getElementById("my_modal_4");
                if (el) el.showModal();
              }
              else{
                const id : number = Number(urlParams.conversationId as string)
                wsProvider.chat.emit("sendGameInvitation", {profileId: id})
                console.log("SENT ! TO ", id)
              }
            }}
            className="
            btn w-24 h-10 bg-gradient-to-b transition-all duration-500 bg-gradient-to-l to-[#d75433] via-[#412170]  from-[#d75433] to-[#412170] bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-md shadow-md text-white/90 font-bold font-Montserrat text-sm invite-button"
          >
            Invite
          </button>
        </div>
          <dialog id="my_modal_4" className="modal">
            <div className="modal-box w-7/12 max-w-xl">
              {!FriendListData.length ? (
                <p className="text-center">You have no available friends to add.</p>
              ) : (
                FriendListData.map((user, index) => (
                  <FriendList
                    getMembers={getMembers}
                    getFriendList={fetchFriendList}
                    key={index}
                    Id={user.id}
                    Username={user.nickname}
                    Avatar={user.avatar}
                    Status={user.status}
                    isInvite={true}
                  />
                ))
              )}
              <div className="modal-action justify-center">
                <form method="dialog">
                  <button className="btn ">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        </>
      )  
      }
      {((urlParams.conversationId as string).endsWith("_channel") ?
          <svg onClick={leaveChannel} className="logout-svg"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
          >
            <path
              d="M11.8659 0C14.9691 0 17.5 2.4875 17.5 5.55V11.5375H9.86919C9.32231 11.5375 8.8899 11.9625 8.8899 12.5C8.8899 13.025 9.32231 13.4625 9.86919 13.4625H17.5V19.4375C17.5 22.5 14.9691 25 11.8405 25H5.6468C2.53089 25 0 22.5125 0 19.45V5.5625C0 2.4875 2.5436 0 5.65952 0H11.8659ZM20.6752 8.18775C21.0502 7.80025 21.6627 7.80025 22.0378 8.17525L25.6877 11.8127C25.8752 12.0002 25.9752 12.2378 25.9752 12.5002C25.9752 12.7503 25.8752 13.0002 25.6877 13.1753L22.0378 16.8127C21.8502 17.0002 21.6003 17.1003 21.3628 17.1003C21.1128 17.1003 20.8627 17.0002 20.6752 16.8127C20.3002 16.4377 20.3002 15.8252 20.6752 15.4502L22.6752 13.4627H17.5002V11.5378H22.6752L20.6752 9.55025C20.3002 9.17525 20.3002 8.56275 20.6752 8.18775Z"
              fill="#484A51"
            />
          </svg>
          : "")}
    </div>
  );
};

export default Header;
