import { useNavContext } from "@/app/(NavbarPages)/context/NavContext";
import { formatChatDate } from "@/app/components/errorChecks";
import React, { useRef, useEffect } from "react";
type messageType = {
  sender_id: string;
  id: string;
  nickname: string;
  message_text: string;
  avatar: string;
  status: string;
  created_at: string;
};

interface Message {
  sender: string;
  text: string;
}

interface BodyProps {
  messages: messageType[];
}

function Body({ messages }: BodyProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const context = useNavContext();
  useEffect(() => {
    // Scroll to the bottom of the messages container whenever new messages are added
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="relative flex-1 overflow-y-auto no-scrollbar p-3"
      ref={messagesContainerRef}
    >
      {messages.length <= 0 ?
                <p className="py-56 text-center text-white text-2xl font-bold font-Montserrat leading-[40.80px] break-words absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Hi There 👋 <br/>You have no conversation yet</p>
      :(messages
        .slice()
        .reverse()
        .map((message: messageType, index: number) => (
          <div
            key={index}
            className={
              Number(message.sender_id) == context.id ||
              Number(message.id) == context.id
                ? "text-right"
                : "text-left"
            }
          >
            <div
              className={`chat ${
                Number(message.sender_id) == context.id ||
                Number(message.id) == context.id
                  ? "chat-end"
                  : "chat-start"
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS chat bubble component"
                    src={message.avatar}
                  />
                </div>
              </div>
              <div className="chat-header">
                <time className="text-xs opacity-50">
                  {formatChatDate(new Date(message.created_at))}
                </time>
              </div>
              <div className="chat-bubble break-words">
                {message.message_text}
              </div>
            </div>
          </div>
        )))}
    </div>
  );
}

export default Body;
