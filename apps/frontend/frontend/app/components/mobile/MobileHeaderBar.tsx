"use client"
import { deleteCookie } from "../errorChecks";
import React from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useEffect, useState, useRef } from "react";
import { useNavContext } from "@/app/(NavbarPages)/context/NavContext";
import { useParams, useRouter } from "next/navigation";
import { getCookie } from "../errorChecks";
import { LogOut } from "../errorChecks";
import { whoami } from "../PersonalInfo";
import { useWebSocketContext } from "@/app/context/WebSocketContext";
import InvitePopUp from "../InvitePopUp";
import { IonIcon } from "@ionic/react";
import * as IonIcons from 'ionicons/icons';
import Link from "next/link";
import ProfileDropDown from "./ProfileDropDown";
import NotificationBell from "../home_components/NotificationsBell";
import DrawerLiveChat from "./DrawerLiveChat";
import DrawerFriendList from "./DrawerFriendList";
import CloseOpenButton from "./CloseOpenButton";
type User = {
  id: number;
  nickname: string;
  avatar: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function MobileHeaderBar() {
  const wsProvider = useWebSocketContext();
  const router = useRouter();
  const context = useNavContext();
  const [inputValue, setInputValue] = useState<string>("");
  const [SenderId, setSenderId] = useState(-1);
  const [isSender, setIsSender] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[] | null>(null);
  const navigation = [
    { name: "Home", href: "/home", current: true },
    { name: "Leaderboard", href: "/leaderboard", current: false },
    { name: "Chat", href: "#", current: false },
    { name: "Profile", href: "#", current: false },
    { name: "Settings", href: "#", current: false },
  ];
  const handleVisibilityChange = () => {
    setIsPageVisible(!document.hidden);
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  
  useEffect(() => {
    const localwhoami = async () => {
      const id = await whoami();
      context.setId(id);
    };
    localwhoami();
    const handleInvite = async (event: any) => {
      setIsSender(false);
      if (event.receiver_id === (await whoami())) {
        setSenderId(event.sender_id);
        context.setisCountDown(true);
      } else if (event.sender_id === (await whoami())) {
        setSenderId(event.sender_id);
        setIsSender(true);
        context.setisCountDown(true);
      }
    };

    const handleAccept = async (event: any) => {
      const id = await whoami();
      if ((event.receiver_id === id || event.sender_id === id) && isPageVisible)
      {
        context.setisCountDown(false);
        router.push("/ping-pong/invite");
      }
    };
    wsProvider.chat.on("sendGameInvitation", handleInvite);
    wsProvider.chat.on("gameInvitationAccepted", handleAccept);
    return () =>{
      wsProvider.chat.off("sendGameInvitation", handleInvite);
      wsProvider.chat.off("gameInvitationAccepted", handleAccept);
    }
  }, []);
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/home/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie("AccessToken")}`
        },
        body: JSON.stringify({
          pattern: inputValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        console.log(data)
      } else {
        console.error('Error fetching users');
      }
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };
  useEffect(() => {
    if (inputValue.trim() !== '') {

      fetchUsers();
    }
    else{
      setUsers(null)
    }
  }, [inputValue]);
  return (
    <>
      {(isOpen ?
      <div className="phone-bar-overlay"></div> : "")
      }
      <div className="relative !z-[101]">
        {context.isCountDown ? (
          <InvitePopUp isSender={isSender} senderId={SenderId} />
        ) : (
          ""
        )}
        <Disclosure as="nav" className="bg-[#272932] rounded-md mt-1 px-4">
          {({ open }) => (
            <>
              <div className="">
                <div className="flex items-center justify-between h-[50px]">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#D75433]">
                    <span className="sr-only">Open main menu</span>
                    <CloseOpenButton open={open} setIsOpen={setIsOpen}/>
                  </Disclosure.Button>

                  <div className="flex-shrink-0">
                    <div className="text-[20px] py-[10px] font-Ethnocentric font-bo ">PONG</div>
                  </div>
                  <div className="path-hover flex gap-5  items-center relative">
                    <ProfileDropDown />
                    <DrawerFriendList />
                    <DrawerLiveChat />
                    <NotificationBell
                      svg={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="26"
                          height="28"
                          viewBox="0 0 26 28"
                          fill="none"
                        >
                          <path
                            d="M9.88486 24.1191C10.6494 23.971 15.3083 23.971 16.0729 24.1191C16.7265 24.2573 17.4333 24.5802 17.4333 25.2852C17.3953 25.9563 16.9651 26.5514 16.3708 26.9293C15.6002 27.4792 14.6957 27.8274 13.7503 27.9529C13.2274 28.015 12.7136 28.0164 12.209 27.9529C11.262 27.8274 10.3576 27.4792 9.58846 26.9278C8.99261 26.5514 8.56244 25.9563 8.52444 25.2852C8.52444 24.5802 9.23125 24.2573 9.88486 24.1191ZM13.0692 0C16.2506 0 19.5004 1.38183 21.4308 3.67453C22.6833 5.15083 23.2579 6.62572 23.2579 8.91842V9.51486C23.2579 11.2732 23.7656 12.3095 24.8828 13.5038C25.7294 14.3837 26 15.5131 26 16.7384C26 17.9623 25.5607 19.1242 24.6806 20.0675C23.5284 21.1983 21.9035 21.9203 20.2452 22.0458C17.842 22.2333 15.4374 22.3912 13.0008 22.3912C10.5626 22.3912 8.15949 22.2968 5.75633 22.0458C4.09646 21.9203 2.47156 21.1983 1.3209 20.0675C0.440807 19.1242 0 17.9623 0 16.7384C0 15.5131 0.272084 14.3837 1.11722 13.5038C2.26939 12.3095 2.74364 11.2732 2.74364 9.51486V8.91842C2.74364 6.56368 3.38509 5.02393 4.70599 3.51661C6.66986 1.31838 9.81783 0 12.9324 0L13.0692 0Z"
                            fill="#8F8F8F"
                          />
                        </svg>
                      }
                    />
                  </div>
                </div>

                <Disclosure.Panel className="block ">
                  <div className="pt-2 ">
                    <div className="relative flex items-center">
                      <div className="w-5 h-5 flex items-center ml-4 absolute pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="25"
                          viewBox="0 0 21 21"
                          fill="none"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.8696 0C15.3117 0 19.7384 4.42666 19.7384 9.86878C19.7384 12.4364 18.753 14.7781 17.1406 16.5356L20.3134 19.7018C20.6103 19.9987 20.6114 20.4791 20.3144 20.776C20.1665 20.926 19.9709 21 19.7763 21C19.5827 21 19.3881 20.926 19.2392 20.7781L16.0281 17.5759C14.3389 18.9287 12.1971 19.7386 9.8696 19.7386C4.42748 19.7386 -0.000198364 15.3109 -0.000198364 9.86878C-0.000198364 4.42666 4.42748 0 9.8696 0ZM9.8696 1.52015C5.26559 1.52015 1.51995 5.26477 1.51995 9.86878C1.51995 14.4728 5.26559 18.2184 9.8696 18.2184C14.4726 18.2184 18.2182 14.4728 18.2182 9.86878C18.2182 5.26477 14.4726 1.52015 9.8696 1.52015Z"
                            fill="#8F8F8F"
                          />
                        </svg>
                      </div>
                      <input value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                        className=" block w-full px-11 py-2 text-base placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D75433] focus:border-transparent "
                        placeholder="Search"
                      />
                    </div>
                    <div className="w-full h-[134px] relative mb-[10px]">
                    <div className="search-results opacity-100 flex !w-[100%] bg-gray-900" style={(users && users.length !== 0 ? { justifyContent: "flex-start" } : {})}>
                      {(users ?
                        (users.length !== 0 ? users.map((user: any) => (
                          <div className="search-user" key={user.id}>
                            <img src={user.avatar} /> <h5 onClick={() =>{router.push(`/profile/${user.id}`)}}>{user.nickname}</h5>
                          </div>
                        )) : <div>No results were found</div>) : <div>Search for users</div>)}
                    </div>
                    </div>
                    <div className="pb-[10px]">
                      <Link className={`${context.nav === "0" ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"}
                          block px-3 py-2 text-base font-medium transition-all duration-500`} onClick={() => { context.setNav("0") }} href="/home">
                          Home
                        </Link>
                        <Link className={`${context.nav === "1" ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"}
                          block px-3 py-2 text-base font-medium transition-all duration-500`} onClick={() => { context.setNav("1"); }} href={`/chat/${context.id}`}>
                          Chat
                      </Link>
                        <Link className={`${context.nav === "2" ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"}
                          block px-3 py-2 text-base font-medium transition-all duration-500`} onClick={() => { context.setNav("2") }} href="/leaderboard">
                          LeaderBoard
                        </Link>
                        <Link className={`${context.nav === "3" ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"}
                          block px-3 py-2 text-base font-medium transition-all duration-500`} onClick={() => { context.setNav("3") }} href={`/profile/${context.id}`}>
                          Profile
                        </Link>
                        <Link className={`${context.nav === "5" ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"}
                          block px-3 py-2 text-base font-medium transition-all duration-500`} onClick={() => {
                          if (context.infoSec !== "3")
                            context.setinfoSec("3");
                          context.setNav("5")
                          const f = document.querySelectorAll("nav .item");
                          f?.forEach((d, i) => {
                            d.classList?.remove("active");
                            if (i == 3)
                              d.classList?.add("active")
                          });
                        }} href={`/profile/${context.id}`}>
                          Settings
                        </Link>
                        <p className="cursor-pointer block px-3 py-2 text-base font-medium transition-all duration-500 text-red-800" onClick={async () => {
                            try {
                              const data = await fetch(
                                "http://localhost:3001/auth/logout",
                                {
                                  headers: {
                                    Authorization: `Bearer ${getCookie(
                                      "AccessToken"
                                    )}`,
                                  },
                                }
                              );
                              deleteCookie("AccessToken");
                              deleteCookie("RefreshToken");
                            } catch (e) {
                              console.log("Error in logging out :", e);
                            }
                            router.push("/signup");
                          }}>
                          Log Out
                        </p>
                    </div>
                  </div>
                </Disclosure.Panel>
              </div>
            </>
          )}
        </Disclosure>
      </div>
      </>
  );
}

export default MobileHeaderBar;

//
//In this code, we have a `MobileHeaderBar` component that uses the `Disclosure` component from the `@headlessui/react` library to create a mobile-friendly navigation bar. The navigation bar includes a menu button, a company logo, and a search bar. The menu items are defined in the `navigation` array.
//
//The `Disclosure` component is used to create a collapsible menu. The `Disclosure.Button` component is used to create the menu button, which toggles the visibility of the menu items. The `Disclosure.Panel` component is used to create the menu items.
//
//The `navigation.map()` function is used to generate the menu items based on the `navigation` array. The `classNames()` function is used to conditionally apply CSS classes to the menu items based on their `current` property.
//
//The `classNames()` function is a utility function that takes a list of CSS classes and returns a string containing only the classes that are not empty or falsy. This function is used to conditionally apply CSS classes to the menu items based on their `current` property.
//
//The `input` element is used to create the search bar. The `placeholder` attribute is used to display a placeholder text in the search bar when it is empty.
//
//The `img` element is used to display the company logo. The `src` attribute is used to specify the URL of the logo image.
//
//The `svg` element is used to display the search icon inside the search bar. The `viewBox` attribute is used to define the coordinate system of the SVG image. The `path` element is used to define the shape of the search icon. The `fill` attribute is used to specify the color of the search icon.
