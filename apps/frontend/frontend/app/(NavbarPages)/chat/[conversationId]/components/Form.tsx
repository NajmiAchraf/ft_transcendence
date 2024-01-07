"use client"
import React, {useState, useEffect} from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useWebSocketContext } from "@/app/context/WebSocketContext";
import { useParams } from "next/navigation";


function Form() {

  const wsProvider = useWebSocketContext()
  const urlParams = useParams()
  const [inputValue, setInputValue] = useState('');
  const submitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
        const conversationId = urlParams.conversationId as string;
        let Id: Number = ((conversationId).endsWith("_channel") ? Number(conversationId.slice(0, -("_channel").length)) : Number(conversationId))
        console.log("Im in submit message")
        if ((urlParams.conversationId as string).endsWith("_channel"))
        {
            wsProvider.chat.emit("channelCreateChat", { channelId: Id, message: inputValue })
            console.log("I submitted a message")
        }
        else {
            wsProvider.chat.emit("directCreateChat", { profileId: Id, message: inputValue })
        }
        setInputValue("")
    }
}
  // const onSubmit: SubmitHandler<FieldValues> = (data) => {
  //   // Call the onSendMessage function with the new message text
  //   onSendMessage(data.message);
  //   // Clear the input field after sending the message
  //   setValue("message", "", { shouldValidate: true });
  // };

  return (
    <form
      className="flex  justify-between p-3 "
      onSubmit={submitMessage}
    >
      <div className="  w-full h-[45px] relative">
      <input
        value={inputValue}
          className=" w-full h-full mb-2 rounded-xl border-none font-normal text-[#8f8f8f] outline outline-[#272932] px-[20px] py-2 text-[12px] bg-[#1A1C26] focus:outline-none focus:ring-2 focus:ring-[#D75433]"
          type="text"
          onChange={(e) => setInputValue(e.target.value)}
          required
          placeholder="Send Message"
        />
        <button
          type="submit"
          className=" absolute right-[10px]  mt-[8px] w-[32px] h-[30px] rounded-md [background:linear-gradient(180deg,rgba(215,84,51,0.75)_0%,rgba(88.9,32.98,202.94,0.75)_100%)]"
        >
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
  );
}

export default Form;
