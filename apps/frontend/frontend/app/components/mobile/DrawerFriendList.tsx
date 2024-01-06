"use client"
import React from "react";
import {
  Drawer,
  Button,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import FriendList from "../home_components/FriendList";
import { getCookie } from "../errorChecks";

type FriendsType = {
  id: number;
  nickname: string;
  avatar: string;
  status: string;
};

function DrawerFriendList() {
  const [FriendListData, setFriendListData] = useState<FriendsType[]>([]);
  useEffect(() => {
    const fetchFriendList = async () => {
      try {
        const res = await fetch("http://localhost:3001/home/friends_list", {
          headers: {
            Authorization: `Bearer ${getCookie("AccessToken")}`,
          },
        });
        const data = await res.json();
        setFriendListData(data);
        console.log("HA DATA FMOBILE : ", data, getCookie("AccessToken"));
      } catch (e) {
        console.log(e);
      }
    };
    fetchFriendList();
  }, []);

  const [openRight, setOpenRight] = useState(false);
  const openDrawerRight = () => setOpenRight(true);
  const closeDrawerRight = () => setOpenRight(false);
  return (
    <div className=" z-50">
      <React.Fragment>
        <button
          onClick={openDrawerRight}
          className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="28"
            viewBox="0 0 40 28"
            fill="none"
          >
            <path
              d="M6 12C8.20625 12 10 10.2062 10 8C10 5.79375 8.20625 4 6 4C3.79375 4 2 5.79375 2 8C2 10.2062 3.79375 12 6 12ZM34 12C36.2062 12 38 10.2062 38 8C38 5.79375 36.2062 4 34 4C31.7937 4 30 5.79375 30 8C30 10.2062 31.7937 12 34 12ZM36 14H32C30.9 14 29.9062 14.4438 29.1812 15.1625C31.7 16.5438 33.4875 19.0375 33.875 22H38C39.1062 22 40 21.1063 40 20V18C40 15.7938 38.2062 14 36 14ZM20 14C23.8687 14 27 10.8688 27 7C27 3.13125 23.8687 0 20 0C16.1312 0 13 3.13125 13 7C13 10.8688 16.1312 14 20 14ZM24.8 16H24.2812C22.9812 16.625 21.5375 17 20 17C18.4625 17 17.025 16.625 15.7187 16H15.2C11.225 16 8 19.225 8 23.2V25C8 26.6562 9.34375 28 11 28H29C30.6562 28 32 26.6562 32 25V23.2C32 19.225 28.775 16 24.8 16ZM10.8187 15.1625C10.0937 14.4438 9.1 14 8 14H4C1.79375 14 0 15.7938 0 18V20C0 21.1063 0.89375 22 2 22H6.11875C6.5125 19.0375 8.3 16.5438 10.8187 15.1625Z"
              fill="#8F8F8F"
            />
          </svg>
        </button>

        <Drawer
          placeholder="friend-list"
          placement="right"
          open={openRight}
          size={400}
          className="p-2 bg-slate bg-[#1A1C26] !h-[100%]"
        >
          <button>
            <XMarkIcon className="h-6 w-6" onClick={closeDrawerRight} />
          </button>
          <div className=" bg-[#272932] rounded-[20px] px-[20px]">
            <div className="font-extrabold text-white text-[12px] pt-[20px] pb-[13px] font-Ethnocentric leading-[38px] ">
              FRIEND LIST
            </div>
            <div className=" h-[78%] py-2 no-scrollbar overflow-auto space-y-[14px] ">
              {!FriendListData.length ? (
                <p className="text-center text-white text-sm font-bold font-['Montserrat'] leading-[40.80px] break-words">
                  Hi There 👋 <br />
                  You still have no Friends
                </p>
              ) : (
                FriendListData.map((user, index) => (
                  <FriendList
                    getMembers={async () => {}}
                    getFriendList={async () => {}}
                    key={index}
                    Id={user.id}
                    Username={user.nickname}
                    Avatar={user.avatar}
                    Status={user.status}
                    isInvite={false}
                  />
                ))
              )}
            </div>
          </div>
        </Drawer>
      </React.Fragment>
    </div>
  );
}

export default DrawerFriendList;
