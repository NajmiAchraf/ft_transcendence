"use client";
import { useState, useEffect } from "react";
import Header from "./Header";
import Body from "./Body";
import Form from "./Form";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { whoami } from "@/app/components/PersonalInfo";
import { getCookie } from "@/app/components/errorChecks";
import { useWebSocketContext } from "@/app/context/WebSocketContext";
import { useNavContext } from "@/app/(NavbarPages)/context/NavContext";
type messageType = {
  id: string;
  sender_id: string;
  nickname: string;
  message_text: string;
  avatar: string;
  status: string;
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
type channelType = {
  channel_id: string;
  channel_name: string;
  avatar: string;
  last_message: string;
  sender_id: number;
  nickname: string;
  created_at: string;
};

function ConversationId({
  isChannelProtected,
  getMembers,
  fetchDMS,
  channels,
  dms,
}: {
  isChannelProtected: boolean | undefined;
  getMembers: () => Promise<void>;
  fetchDMS: () => Promise<void>;
  channels: channelType[];
  dms: dmType[];
}) {
  const conversation = {
    id: 1,
    name: "Conversation Name",
    isGroup: false,
    users: [],
    otherUser: null,
    isActive: true,
    statusText: "Active",
    members: [],
  };
  const router = useRouter(); 
  const urlParams = useParams();
  const context = useNavContext();
  const wsProvider = useWebSocketContext();
  const [messages, setMessages] = useState<messageType[]>([]);
  // const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
  //   []
  // );
  useEffect(() => {
    const fetchMessages = async () => {
      setMessages([]);
      if (Number(urlParams.conversationId as string) != (await whoami())) {
        try {
          const suffix: string = "_channel";
          let conversationId: string = urlParams.conversationId as string;
          let url: string = "dm_history";
          if (conversationId.endsWith(suffix)) {
            conversationId = conversationId.slice(0, -suffix.length);
            url = "channel_message_history";
          }
          const data = await fetch(`http://localhost:3001/chatHttp/${url}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("AccessToken")}`,
            },
            body: JSON.stringify(
              url === "dm_history"
                ? { profileId: Number(conversationId) }
                : { channelId: Number(conversationId) }
            ),
          });

          if (!data.ok) {
            throw new Error("Failed to fetch data");
          }
          const res = await data.json();
          console.log(res);
          setMessages(res);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchMessages();
  }, []);
  useEffect(() => {
    wsProvider.chat.on("receiveChannelMessage", async (event) => {
      //await fetchChannels()
      if ((urlParams.conversationId as string).endsWith("_channel"))
        setMessages((prevMessages) => [event, ...prevMessages]);
    });

    wsProvider.chat.on("receiveDM", async (event) => {
      await fetchDMS();
      if (!(urlParams.conversationId as string).endsWith("_channel"))
        setMessages((prevMessages) => [event, ...prevMessages]);
    });
  }, []);
  let SenderOBJ = {};
  if ((urlParams.conversationId as string).endsWith("_channel")) {
    channels.map((channel, index) => {
      if (Number(channel.channel_id) == Number((urlParams.conversationId as string).slice(0, -"_channel".length)))
        SenderOBJ = {
          avatar: channel.avatar,
          nickname: channel.channel_name,
          status: "test",
        };
      return;
    });
  } else {

    dms.map((dm, index) => {
      if (
        Number(dm.profileId) == Number(urlParams.conversationId as string)
      ) {
        SenderOBJ = dm;
        return;
      }
    });
  }
  if (Object.keys(SenderOBJ).length === 0 && context.id != Number(urlParams.conversationId as string))
  {
    return (
      <div className="error-section error-chat"><img src="/astro.png"></img><h2>Seems like this User is Unavailable !</h2> <Link href={`/chat/${context.id}`}>Go back<span></span><span></span><span></span><span></span></Link></div>
    );
  }
  return (
    <div>
      <div className="relative h-[84vh]">
        {Number(urlParams.conversationId as string) == context.id ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex place-items-center w-[476px] text-center text-white text-2xl font-bold font-['Montserrat'] leading-[40.80px]">Hi There 👋 <br/>Add a Friend and Enjoy the conversation.</div>
        ) :
          <div className="flex flex-col h-full justify-between ">
            <Header isChannelProtected={isChannelProtected} getMembers={getMembers} conversation={SenderOBJ} secondId = {urlParams.conversationId as string} />
            <Body messages={messages} />
            <Form />
          </div>
      }
      </div>
    </div>
  );
}

export default ConversationId;
