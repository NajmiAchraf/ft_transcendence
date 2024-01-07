"use client"
import React from "react";
import { useRouter } from "next/navigation";
interface HomeCardProps {
  title: string;
  description: string;
  imgUrl: string;
  modeCheck: boolean;
}

function HomeCard({ title, description, imgUrl, modeCheck }: HomeCardProps) {
  const router = useRouter();
  return (
    // <div>
    //   ff
    // </div>
    <div className="flex flex-col rounded-[20px] bg-[#272932] w-full md:h-auto h-[300px] drop-shadow-lg ">
      <div
        className={`md:h-[50%] h-[55%] w-full ${imgUrl} bg-cover bg-center rounded-t-[20px]`}
      />
      <div className="flex flex-col flex-1 justify-between pb-5 px-[15px]">
        <h1 className=" mt-[10px] text-[14px] font-black">{title}</h1>
        <p className="tracking-wide text-opacity-80 text-[12px] font-Montserrat md:text-[11px] mt-[3px] font-light md:leading-[12px] max-w-[500px] py-1 break-words">{description}</p>
        <button
          onClick={() => {
            modeCheck ? router.push("/ping-pong") : router.push("/ping-pong/bot")}}
          className={`text-[12px]  rounded-[6px] [background:linear-gradient(180deg,rgba(215,84,51,0.75)_0%,rgba(88.9,32.98,202.94,0.75)_100%)] py-[5px] px-[17px] font-black w-fit mt-[5px]`}>
          PLAY NOW
        </button>
      </div>
    </div>
  );
}

export default HomeCard;
