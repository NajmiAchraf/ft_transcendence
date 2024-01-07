"use client"
import React from "react";
import NavItems from "./NavItems";
import { deleteCookie } from "../errorChecks";
import { IonIcon } from '@ionic/react';
import Link from 'next/link';
import * as IonIcons from 'ionicons/icons';
import { useNavContext } from "@/app/(NavbarPages)/context/NavContext";
import { useParams, useRouter } from 'next/navigation';
import {useEffect, useState, useRef } from 'react';
import { getCookie } from "../errorChecks";
import { LogOut } from "../errorChecks";
import { whoami } from "../PersonalInfo";
import { useWebSocketContext } from "@/app/context/WebSocketContext";
import InvitePopUp from "../InvitePopUp";
type User = {
  id: number;
  nickname: string;
  avatar: string;
}
const NavBar = () => {
  const wsProvider = useWebSocketContext()
  const router = useRouter()
  const context = useNavContext()
  const [SenderId, setSenderId] = useState(-1)
  const [isSender, setIsSender] = useState(false)
  const searchSecRef = useRef<HTMLDivElement>(null); // Specify the type here
  
  useEffect(() => {
    const localwhoami = async () => {
      const id = await whoami()
      context.setId(id)
    }
    localwhoami()
    const handleInvite = async (event : any) =>{
      setIsSender(false)
      if (document.hidden)
        return ;
      if (event.receiver_id === await whoami())
      {
        setSenderId(event.sender_id)
        context.setisCountDown(true)
      }
      else if (event.sender_id === await whoami()){
        setSenderId(event.sender_id)
        setIsSender(true)
        context.setisCountDown(true)
      }
    }

    const handleAccept = async (event : any) =>{
      if (document.hidden)
        return ;
      const id = await whoami()
      if ((event.receiver_id === id || event.sender_id === id))
      {
        context.setisCountDown(false);
        router.push("/ping-pong/invite");
      }
    }
    wsProvider.chat.on("sendGameInvitation", handleInvite)
    wsProvider.chat.on("gameInvitationAccepted", handleAccept)
    return () =>{
      wsProvider.chat.off("sendGameInvitation", handleInvite)
      wsProvider.chat.off("gameInvitationAccepted", handleAccept)
    }
  }, []);
  return (
    <>
      {( context.isCountDown ? 
              <InvitePopUp isSender={isSender} senderId={SenderId}/>: "")}
      <div className=" hidden fixed text-white w-[126px] bg-[#272932] h-screen md:flex flex-col justify-between pb-[50px] items-center place-content-center">
        <div className="text-[20px] py-[10px] pb-[40px] font-Ethnocentric font-bo ">PONG</div>
        <NavItems />
        <div>
          <svg className="logout-svg"
            onClick={async () =>{
              try {
                const data = await fetch(`${process.env.API_URL}/auth/logout`,
                    {
                        headers: {
                            Authorization: `Bearer ${getCookie("AccessToken")}`
                        }
                    })
                deleteCookie("AccessToken");
                deleteCookie("RefreshToken");
            }
            catch (e) {
                console.log("Error in logging out :", e)
            }
            router.push("/signup")

        }}
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
        </div>
      </div>
    </>
  );
};

export default NavBar;