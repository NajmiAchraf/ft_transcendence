"use client";
import React from "react";
import { TabPanel, useTabs } from "react-headless-tabs";
import LiveChat from "../../../components/home_components/Dms";
import ConversationId from "./components/ConversationId";
import { url } from "inspector";
import {
  formatChatDate,
  formatTimeDifference,
  getCookie,
} from "@/app/components/errorChecks";
import { whoami } from "@/app/components/PersonalInfo";
import { useEffect, useState } from "react";
import { IonIcon } from "@ionic/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as IonIcons from "ionicons/icons";
import { useWebSocketContext } from "@/app/context/WebSocketContext";
import { useNavContext } from "@/app/(NavbarPages)/context/NavContext";
import { useRouter } from "next/navigation";
import DropdownOwner from "./components/DropdownOwner";
import DropdownAdmin from "./components/DropdownAdmin";
import DropDownMember from "./components/DropdownMember";

type messageType = {
  sender_id: string;
  nickname: string;
  message_text: string;
  avatar: string;
  status: string;
  created_at: string;
};

type channelType = {
  channel_id: string;
  channel_name: string;
  avatar: string;
  last_message: string;
  sender_id: number;
  nickname: string;
  created_at: string;
};

type dmType = {
  profileId: string;
  nickname: string;
  avatar: string;
  status: string;
  message_text: string;
  created_at: string;
  isSender: boolean;
};
type memberType = {
  id: string;
  nickname: string;
  avatar: string;
  status: string;
  operate: boolean;
  isSelf: boolean;
  isChannelProtected: boolean;
};

type channelMembersType = {
  owner: memberType;
  admins: memberType[];
  members: memberType[];
};
type FriendType = {
  id: string;
  nickname: string;
  avatar: string;
  status: string;
};
function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateChannel, setIsCreateChannel] = useState(false);
  const [privacy, setprivacy] = useState("");
  const context = useNavContext();
  const items = ["Messages", "Settings"];
  const [selectedTab, setSelectedTab] = useTabs(items);
  const wsProvider = useWebSocketContext();
  const router = useRouter();
  const [dms, setDms] = useState<dmType[]>([]);
  const [channels, setChannels] = useState<channelType[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | ArrayBuffer | null>("/3ziya.png");
  const hover = useNavContext()
  useEffect(
    () => {
      context.setNav("1")
    }
  , []);
  useEffect(() =>{
    const ChannelCreated = ()=>{
      setShowModal(false)
      fetchChannels();
    }
    wsProvider.chat.on("channelCreated", ChannelCreated)
    return () =>{wsProvider.chat.off("channelCreated", ChannelCreated)}
  }, [])
  const createChannel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(
      document.getElementById("addChannelFrom") as HTMLFormElement
    );
    const avatarInput = formData.get("avatar") as File;
    if (avatarInput.name.length <= 0) {
      // If no file is selected, set a default avatar
      const defaultAvatarUrl = "/3ziya.png"; // Replace with the actual path to your default avatar image
      const defaultAvatarBlob = await fetch(defaultAvatarUrl).then((res) => res.blob());
    
      const defaultAvatarFile = new File([defaultAvatarBlob], "default-avatar.png", { type: "image/png" });
    
      // Append the default avatar to the FormData
      formData.append("avatar", defaultAvatarFile);
    }
    try {
      const data = await fetch(`${process.env.API_URL}/chatHttp/createChannel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("AccessToken")}`,
        },
        body: formData,
      });
      if (!data.ok) {
        throw new Error("something went wrong");
      }
      const res = await data.json()
      console.log("ha ana fin hhh\n", res.id);
      wsProvider.chat.emit("createChannel", {channelId : res.id});

      router.push(`/chat/${res.id}_channel`)
    } catch (e) { }
  };
  const changeTab = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = (e.target as HTMLElement).dataset.tab;
    if (typeof target !== "string") {
      return;
    }
    setSelectedTab(target);
    console.log(selectedTab);
  };
  const fetchChannels = async () => {
    try {
      const data = await fetch(`${process.env.API_URL}/chatHttp/channels`, {
        headers: {
          Authorization: `Bearer ${getCookie("AccessToken")}`,
        },
      });
      if (!data.ok) throw new Error("Something went wrong");
      const res = await data.json();
      setChannels(res);
      console.log(channels);
    } catch (e) {
      console.log(e);
    }
  };
  const fetchDMS = async () => {
    try {
      const data = await fetch(`${process.env.API_URL}/chatHttp/dms`, {
        headers: {
          Authorization: `Bearer ${getCookie("AccessToken")}`,
        },
      });
      if (!data.ok) throw new Error("Something went wrong");
      const res = await data.json();
      setDms(res);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetchDMS();
    fetchChannels();
  }, []);
  const displayImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            if (e.target) setPreviewSrc(e.target.result);
        };

        reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    const handleKickChannelMember = async (event: any) => {
      if (event.message === "you have been kicked") {
        router.push(`/profile/${context.id}`);
      }
    };

    wsProvider.chat.on("kickChannelMember", handleKickChannelMember);

    const handleBanChannelMember = async (event: any) => {
      if (event.message === "you have been banned") {
        router.push(`/profile/${context.id}`);
      }
    };

    wsProvider.chat.on("banChannelMember", handleBanChannelMember);

    const handleAddChannelAdmin = async (event: any) => {
      getMembers();
    };

    wsProvider.chat.on("addChannelAdmin", handleAddChannelAdmin);

    const handleAddChannelMember = async (event: any) => {
      if (Number(event.id) == context.id) {
        await fetchChannels();
      }
    };

    wsProvider.chat.on("addChannelMember", handleAddChannelMember);

    const handleMuteChannelMember = async (event: any) => {
      if ((urlParams.conversationId as string).endsWith) {
        const Id: string = (urlParams.conversationId as string).slice(
          0,
          -"_channel".length
        );
        if (event.channelId === Id) {
          const el = document.querySelector(".sendbox button");
          if (el) el.classList.add("non-active-btn");
        }
      }
    };
    wsProvider.chat.on("muteChannelMember", handleMuteChannelMember);

    const handleLeaveChannelSelf = async (event: any) => {
      router.push(`/chat/${context.id}`);
      await fetchChannels();
    };
    wsProvider.chat.on("leaveChannelSelf", handleLeaveChannelSelf);

    const handleLeaveChannelOthers = async (event: any) => {
      await getMembers();
    };
    wsProvider.chat.on("leaveChannelOthers", handleLeaveChannelOthers);
    const handleJoinedEvent = async () => {
      await fetchChannels();
    };
    wsProvider.chat.on("joined", handleJoinedEvent);
    return () => {
      wsProvider.chat.off("joined", handleJoinedEvent);
      wsProvider.chat.off("leaveChannelOthers", handleLeaveChannelOthers);
      wsProvider.chat.off("leaveChannelSelf", handleLeaveChannelSelf);
      wsProvider.chat.off("addChannelAdmin", handleAddChannelAdmin);
      wsProvider.chat.off("muteChannelMember", handleMuteChannelMember);
      wsProvider.chat.off("addChannelMember", handleAddChannelMember);
      wsProvider.chat.off("banChannelMember", handleBanChannelMember);
      wsProvider.chat.off("kickChannelMember", handleKickChannelMember);
    };
  }, [router, context.id]);
  const getSelectedTabIndex = () =>
    items.findIndex((item) => item === selectedTab);

  const dropdownItems = [
    { text: "Dashboard" },
    { text: "Settings" },
    { text: "Earnings" },
  ];
  const urlParams = useParams();
  const [channelMembers, setChannelMembers] =
    useState<channelMembersType | null>(null);
  const getMembers = async () => {
    try {
      const suffix: string = "_channel";
      let conversationId: string = urlParams.conversationId as string;
      if (conversationId.endsWith(suffix)) {
        conversationId = conversationId.slice(0, -suffix.length);
      }

      const data = await fetch(
        `${process.env.API_URL}/chatHttp/channel_members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("AccessToken")}`,
          },
          body: JSON.stringify({ channelId: Number(conversationId) }),
        }
      );

      if (!data.ok) {
        throw new Error("Failed to fetch data");
      }
      const res: channelMembersType = await data.json();
      setChannelMembers(res);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    if ((urlParams.conversationId as string).endsWith("_channel")) getMembers();
  }, []);
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="fadeInSection chat-new-sec flex my-4 ">
      <div className="chatting-section flex flex-row w-full rounded-[20px]  border-4 border-[#272932] mr-3 ">
        <div className="dms-section bg-[#272932] h-full w-[30%] rounded-tl-[20px] rounded-bl-[20px] ">
          <nav className="text-center relative">
            <div
              className="absolute bottom-0 left-0 h-1 bg-[#5742A9] transition-all ease-in-out duration-200 "
              style={{
                width: `calc(50%)`,
                transform: `translateX(${selectedTab === "Settings" ? "100%" : "0%"})`,
              }}
            />
            <div className="flex">
              {items.map((item) => (
                <a
                  key={item}
                  className={`cursor-pointer flex-grow block p-4 text-decoration-none font-montserrat ${item === "Settings" &&
                      !(urlParams.conversationId as string).endsWith("_channel")
                      ? "pointer-events-none"
                      : ""
                    } ${selectedTab === item ? "text-white" : "text-[#A4A4A4]"}`}
                  onClick={changeTab}
                  data-tab={item}
                >
                  {item}
                </a>
              ))}
            </div>
          </nav>
          <div className="p-4 overflow-auto no-scrollbar h-[77vh] ">
            {items.map((item) => (
              <TabPanel key={item} hidden={selectedTab !== item}>
                {item && item === "Messages" ? (
                  <>
                    {dms.map((message, index) => (
                      <Link
                        href={`/chat/${message.profileId}`}
                        key={index}
                        className="flex m-5 text-left space-y-8"
                      >
                        <LiveChat
                          Username={message.nickname}
                          Avatar={message.avatar}
                          Message={`${message.isSender ? "You : " : ""}${message.message_text
                            }`}
                          Time={formatChatDate(new Date(message.created_at))}
                          status={message.status}
                        />
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex flex-col h-[100vh] gap-y-[20px] no-scrollbar overflow-auto ">
                      <p className="text-xs font-extrabold font-Montserrat capitalize leading-[38px]">
                        Channel Owners
                      </p>
                      <div className="flex justify-between items-center space-x-2">
                        <div className="flex items-center space-x-3">
                          <img
                            className="w-[49px] z-30 h-[49px] rounded-xl"
                            src={channelMembers?.owner.avatar}
                          />
                          <Link
                            href={`/profile/${channelMembers?.owner.id}`}
                            className="text-white text-[14px] font-medium font-Montserrat"
                          >
                            {channelMembers?.owner.nickname}
                          </Link>
                        </div>
                        <div>
                          {Number(channelMembers?.owner.id) == context.id ? (
                            <DropdownOwner
                              isChannelProtected={
                                channelMembers?.owner.isChannelProtected
                              }
                              getMembers={getMembers}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-extrabold font-Montserrat capitalize leading-[38px]">
                        {" "}
                        Channel Admins
                      </p>
                      {channelMembers?.admins.map((admin, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center space-x-2"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              className="w-[49px] z-30 h-[49px] rounded-xl"
                              src={admin.avatar}
                            />
                            <Link
                              href={`/profile/${admin.id}`}
                              className="text-white text-[14px] font-medium font-Montserrat"
                            >
                              {admin.nickname}
                            </Link>
                          </div>
                          <div>
                            {admin.operate ? (
                              <DropdownAdmin
                                getMembers={getMembers}
                                adminId={admin.id}
                              />
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-xs font-extrabold font-Montserrat capitalize leading-[38px]">
                        Members
                      </p>
                      {channelMembers?.members.map((member, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center space-x-2"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              className="w-[49px] z-30 h-[49px] rounded-xl"
                              src={member.avatar}
                            />
                            <Link
                              href={`/profile/${member.id}`}
                              className="text-white text-[14px] font-medium font-Montserrat"
                            >
                              {member.nickname}
                            </Link>
                          </div>
                          <div>
                            {member.operate ? (
                              <DropDownMember
                                getMembers={getMembers}
                                memberId={member.id}
                              />
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabPanel>
            ))}
          </div>
        </div>
        <div className="messages-section w-[70%]">
          <ConversationId
            isChannelProtected={channelMembers?.owner.isChannelProtected}
            getMembers={getMembers}
            fetchDMS={fetchDMS}
            channels={channels}
            dms={dms}
          ></ConversationId>
        </div>
      </div>
      <div className=" channels-section w-[80px] space-y-[20px] h-[84vh] overflow-y-auto overflow-x-hidden no-scrollbar">
        <button
          onClick={async () => setShowModal(true)}
          className=" flex place-content-center items-center h-[70px] w-[70px] rounded-[20px] bg-[#1F2937] border-2 border-[#374151]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M19.1667 9.16667H10.8333V0.833333C10.8333 0.61232 10.7455 0.400358 10.5893 0.244078C10.433 0.0877974 10.221 0 10 0V0C9.77899 0 9.56702 0.0877974 9.41074 0.244078C9.25446 0.400358 9.16667 0.61232 9.16667 0.833333V9.16667H0.833333C0.61232 9.16667 0.400358 9.25446 0.244078 9.41074C0.0877974 9.56702 0 9.77899 0 10H0C0 10.221 0.0877974 10.433 0.244078 10.5893C0.400358 10.7455 0.61232 10.8333 0.833333 10.8333H9.16667V19.1667C9.16667 19.3877 9.25446 19.5996 9.41074 19.7559C9.56702 19.9122 9.77899 20 10 20C10.221 20 10.433 19.9122 10.5893 19.7559C10.7455 19.5996 10.8333 19.3877 10.8333 19.1667V10.8333H19.1667C19.3877 10.8333 19.5996 10.7455 19.7559 10.5893C19.9122 10.433 20 10.221 20 10C20 9.77899 19.9122 9.56702 19.7559 9.41074C19.5996 9.25446 19.3877 9.16667 19.1667 9.16667Z"
              fill="#4B5563"
            />
          </svg>
        </button>
        {showModal ? (
          <>
            <div className="channel-overlay">
              <div className="relative w-auto my-6 mx-auto max-w-3xl">
                <div className="border-0 rounded-xl shadow-lg relative flex flex-col w-full bg-[#272932] outline-none focus:outline-none">
                  <div className="flex items-start justify-between p-5 border-b border-solid border-gray-500 rounded-t ">
                    <h3 className="text-xl font-bold font-Montserrat ">Add Your Own Channel</h3>
                  </div>
                  <div className="relative px-6 flex-auto">
                    <form id="addChannelFrom" onSubmit={createChannel}
                      className="create-channel-form flex flex-col space-y-3 p-4"
                    >

                      <label htmlFor="upload-photo" className="text-sm font-medium text-white">Channel Avatar</label>
                      <div className="channel-avatar">
                        <img src={previewSrc as string} />
                        <input name="avatar" id="upload-photo" type="file" placeholder="xd" onChange={displayImage} accept="image/*"></input>
                    </div>
                      <label className="block text-sm font-medium text-white">Channel Name</label>
                      <input name="channelName" className="border-none rounded-xl text-white text-sm bg-[#1A1C26] shadow-md font-Montserrat font-medium p-[15px]"
                        placeholder="Enter channel name"
                        required />
                      <label className="block text-sm font-medium text-white"> Select Privacy </label>

                      <select
                        name="privacy"
                        defaultValue="public"
                        onChange={(e) => setprivacy(e.target.value)}
                        className="border-none rounded-xl text-white text-base bg-[#1A1C26] shadow-md font-Montserrat font-medium p-[15px]"
                        required
                      >
                        <option value="public">public</option>
                        <option value="protected">protected</option>
                        <option value="private">private</option>
                      </select>
                      {privacy === "protected" ? (
                        <input
                          type="password"
                          name="password"
                          placeholder="Enter password"
                          className="channel-pass border-none text-sm rounded-xl text-white p-[15px] bg-[#1A1C26] shadow-md font-Montserrat font-medium"
                          required
                        />
                      ) : (
                        ""
                      )}  
                      <div className="flex items-center justify-end gap-2 p-6 border-t border-solid border-gray-500 rounded-b">
                      <button
                        className="channel-cancel-btn block w-24 h-10  px-4 text-sm font-extrabold font-Montserrat capitalize leading-[38px] text-red-500 rounded-md hover:bg-red-700 hover:text-white"
                        type="button"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="w-24 h-10 transition-all duration-500 bg-gradient-to-l to-[#d75433] via-[#412170]  from-[#d75433] to-[#412170] bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-md shadow-md text-white/90 font-bold font-Montserrat text-sm"
                        type="submit"
                      >
                        Add
                      </button>
                    </div>                     
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {channels.map((channel, index): any => (
          <Link
            href={`/chat/${channel.channel_id}_channel`}
            key={index}
            className="dropdown dropdown-hover"
          >
            <button className=" flex place-content-center items-center h-[70px] w-[70px] rounded-[20px] bg-[#1F2937] border-2 border-[#374151]">
              <img
                src={channel.avatar}
                alt=""
                className="w-full h-full rounded-[20px]"
              />
            </button>
            <div
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-[90px]"
            >
              {channel.channel_name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Chat;
