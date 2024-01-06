"use client"
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import NotificationBell from "./NotificationsBell";
import React, { Fragment, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useNavContext } from "@/app/(NavbarPages)/context/NavContext";
import { deleteCookie, getCookie } from "../errorChecks";
import { useRouter } from "next/navigation";

const dropdown = [
  {
    name: "My Profile",
    // description: 'Measure actions your users take',
    href: "##",
    // icon: IconOne,
  },
  {
    name: "Settings",
    // description: 'Create your own targeted content',
    href: "##",
    // icon: IconTwo,
  },
];
type User = {
  id: number;
  nickname: string;
  avatar: string;
}

function HeaderBar() {
  const context = useNavContext();
  const router = useRouter()
  const [users, setUsers] = useState<User[] | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const searchSecRef = useRef<HTMLDivElement>(null); // Specify the type here

  const showSearch = (option: number) => {
    let element: HTMLElement | null = document.querySelector(".headerbar-overlay")
    let element2: HTMLElement | null = document.querySelector(".search-results")
    let element3: HTMLElement | null = document.querySelector(".max-screen-search")
    if (element && element2 && element3) {
      if (option) {
        element3.style.zIndex = "1000"
        element.style.display = "block"
        element.style.animation = "fadeIn 0.5s forwards"
        element2.style.display = "flex"
        element2.style.animation = "fadeIn 0.5s forwards"
      }
      else {
        element3.style.zIndex = "0"
        element2.style.animation = "fadeOut 0.3s forwards"
        setTimeout(() => { if (element2) element2.style.display = "none" }, 400)
        element.style.animation = "fadeOut 0.5s forwards"
        setTimeout(() => { if (element) element.style.display = "none" }, 600)
      }
    }
  }
  
  useEffect(() => {
    if (inputValue.trim() !== '') {
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

      fetchUsers();
    }
    else{
      setUsers(null)
    }
  }, [inputValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleOutsideClick = (event : MouseEvent) => {
    // Check if the click is outside the search-sec div
    if (searchSecRef.current && !searchSecRef.current.contains(event.target as Node)) {
      showSearch(0);
    }
  };
  useEffect(() => {
    // Attach event listener for outside click on mount
    document.addEventListener('click', handleOutsideClick);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const avatar = {
    backgroundImage: "url(/profile.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  return (
    <div className="flex justify-between py-[15px]">
      <div className="relative flex items-center space-x-2">
        {/* <div className=" md:hidden flex">5555</div> */}
        <div className="headerbar-overlay"></div>
        <div ref={searchSecRef} className="max-screen-search relative">
        <div className="relative">
          <div className="w-5 h-5 absolute ml-3 pointer-events-none px-[18px] top-[20px] left[-4px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
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
            <input
              onChange={handleInputChange} onFocus={() => showSearch(1)}
              className=" w-[160px] md:w-[250px] lg:w-[526px] h-[62px] px-[66px] py-2 bg-[#272932] focus:outline-none focus:ring-2 focus:ring-[#D75433] rounded-2xl border-none font-normal text-[#8f8f8f] text-[18px] "
              placeholder="Search"
            />
          </div>
          <div className="search-results absolute w-[160px] md:w-[250px] lg:w-[526px]" style={(users && users.length !== 0 ? { justifyContent: "flex-start" } : {})}>
                  {(users ?
                    (users.length !== 0 ? users.map((user: any) => (
                      <div className="search-user" key={user.id}>
                        <img src={user.avatar} /> <h5 onClick={() =>{showSearch(0); router.push(`/profile/${user.id}`)}}>{user.nickname}</h5>
                      </div>
                    )) : <div>No results were found</div>) : <div>Search for users</div>)}
                </div>
        </div>
      </div>
      <div className=" flex space-x-[25px]">
        <div className="ionicon-section w-[62px] h-[62px] bg-[#272932] rounded-[20px]">
          <div className=" flex place-content-center items-center p-5 ">
            <NotificationBell
              svg={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="25"
                  viewBox="0 0 22 25"
                  fill="none"
                >
                  <path
                    d="M8.20117 21.1081C8.81503 20.9785 12.5555 20.9785 13.1694 21.1081C13.6941 21.229 14.2616 21.5116 14.2616 22.1286C14.2311 22.716 13.8857 23.2367 13.4086 23.5674C12.7898 24.0487 12.0637 24.3535 11.3046 24.4633C10.8848 24.5176 10.4723 24.5188 10.0671 24.4633C9.30684 24.3535 8.58071 24.0487 7.9632 23.5662C7.48481 23.2367 7.13944 22.716 7.10893 22.1286C7.10893 21.5116 7.67641 21.229 8.20117 21.1081ZM10.7578 0C13.312 0 15.9212 1.20932 17.4711 3.21581C18.4767 4.5078 18.938 5.79857 18.938 7.80505V8.32703C18.938 9.86583 19.3456 10.7728 20.2426 11.818C20.9223 12.588 21.1396 13.5765 21.1396 14.6488C21.1396 15.7199 20.7869 16.7367 20.0803 17.5623C19.1552 18.552 17.8506 19.1838 16.5192 19.2936C14.5898 19.4577 12.6591 19.5959 10.7028 19.5959C8.74534 19.5959 6.81592 19.5132 4.88649 19.2936C3.55383 19.1838 2.24924 18.552 1.32541 17.5623C0.618804 16.7367 0.264893 15.7199 0.264893 14.6488C0.264893 13.5765 0.483341 12.588 1.16188 11.818C2.08693 10.7728 2.46769 9.86583 2.46769 8.32703V7.80505C2.46769 5.74427 2.98269 4.39674 4.0432 3.0776C5.61994 1.15379 8.14736 0 10.6479 0L10.7578 0Z"
                    fill="#8F8F8F"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Profile dropdown */}
        <div>
          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  className=" w-[62px] h-[62px] rounded-[20px] "
                  style={avatar}
                ></Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute left-0 z-10 mt-3 w-[180px]  -translate-x-1/2 transform px-4 sm:px-0 ">
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                      <div className="relative  bg-[#272932] shadow-xl text-white p-7 ">
                        <Link
                          href={`/profile/${context.id}`}
                          className="-mx-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out border-2 border-[#272932] hover:border-[#D75433] focus-visible:ring focus-visible:ring-orange-500/50"
                        >
                          <p className="text-sm font-medium">Profile</p>
                        </Link>
                        <Link
                          onClick={() => {
                            if (context.infoSec !== "3")
                              context.setinfoSec("3");
                            context.setNav("4");
                            const f = document.querySelectorAll("nav .item");
                            f?.forEach((d, i) => {
                              d.classList?.remove("active");
                              if (i == 3) d.classList?.add("active");
                            });
                          }}
                          href={`/profile/${context.id}`}
                          className="-mx-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out border-2 border-[#272932] hover:border-[#D75433] focus-visible:ring focus-visible:ring-orange-500/50"
                        >
                          <p className="text-sm font-medium">Settings</p>
                        </Link>

                        <div className=" divider" />
                        <button
                          onClick={async () => {
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
                          }}
                          className="-mx-3 flex items-center text-red-400 rounded-lg p-2 transition duration-150 ease-in-out border-2 border-[#272932] hover:border-[#D75433] focus-visible:ring focus-visible:ring-orange-500/50 w-full text-left"
                        >
                          <p className="text-sm font-medium ">Log Out</p>
                        </button>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>
    </div>
  );
}

export default HeaderBar;