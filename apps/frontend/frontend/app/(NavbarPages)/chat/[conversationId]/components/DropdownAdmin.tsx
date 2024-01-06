"use client"
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { useParams } from "next/navigation";
import { useNavContext } from "@/app/(NavbarPages)/context/NavContext";
import { useWebSocketContext } from "@/app/context/WebSocketContext";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

function DropdownAdmin({ getMembers, adminId }: { getMembers: () => Promise<void>, adminId : string }) {
    const urlParams = useParams()
    const context = useNavContext()
    const wsProvider = useWebSocketContext()
    const kickChannelMember = async (_profileId: string) => {
        const _channelId: string = (urlParams.conversationId as string).slice(0, -("_channel").length);
        wsProvider.chat.emit("kickChannelMember", { profileId: Number(_profileId), channelId: Number(_channelId) })
        setTimeout(() => { getMembers() }, 100)
    }
    const addChannelAdmin = async (_profileId: string) => {
        const _channelId: string = (urlParams.conversationId as string).slice(0, -("_channel").length);
        wsProvider.chat.emit("addChannelAdmin", { profileId: Number(_profileId), channelId: Number(_channelId) })
        setTimeout(() => { getMembers() }, 100)
    }
    const muteChannelMember = async (_profileId: string) => {
        console.log("hana dkhelt")
        const _channelId: string = (urlParams.conversationId as string).slice(0, -("_channel").length);
        console.log(_profileId, _channelId)
        wsProvider.chat.emit("muteChannelMember", { profileId: Number(_profileId), channelId: Number(_channelId) })
        console.log(_profileId, _channelId)
    }
    const banChannelMember = async (_profileId: string) => {
        const _channelId: string = (urlParams.conversationId as string).slice(0, -("_channel").length);
        wsProvider.chat.emit("banChannelMember", { profileId: Number(_profileId), channelId: Number(_channelId) })
        setTimeout(() => { getMembers(); }, 100)
    }

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg dark:text-white focus:ring-gray-50 dark:bg-[#272932] dark:hover:bg-gray-700 dark:focus:ring-gray-600">
            <span className="sr-only">Open options</span>
            <EllipsisHorizontalIcon className="h-6 w-6" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="z-50 origin-top-right absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-[#1A1C26] ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-0">
              <Menu.Item>
                {({ active }) => (
                  <button
                    // onClick={() => setPassUpdateState("update")}
                    onClick={()=> kickChannelMember(adminId)}
                    className={classNames(
                      active
                        ? "rounded-md bg-slate-500 text-white"
                        : "text-gray-300",
                      "block w-full px-4 text-xs font-extrabold font-Montserrat capitalize leading-[38px]"
                    )}
                  >
                    Kick
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => muteChannelMember(adminId)}
                    className={classNames(
                      active
                        ? "rounded-md bg-slate-500 text-white"
                        : "text-gray-300",
                      "block w-full px-4 text-xs font-extrabold font-Montserrat capitalize leading-[38px]"
                    )}
                  >
                    Mute
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => banChannelMember(adminId)}
                    className={classNames(
                      active
                        ? "rounded-md bg-red-700 text-white "
                        : "text-red-500",
                      "block w-full px-4 text-xs font-extrabold font-Montserrat capitalize leading-[38px]"
                    )}
                  >
                    Ban
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      {/* <div style={(isOpen ? {display: "flex"} : {})} className="_2factor">
                    <img></img>
                    <label htmlFor="twofactorcode">Update your Password :</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      id="twofactorcode"
                      type="password"
                    ></input>
                    <div className="buttons">
                      <button
                        onClick={UpdatePassword}
                        type="button"
                        className="verify-btn"
                      >
                        Update
                      </button>
                      <div className="btn-container">
                        <button
                            onClick={() => {
                                const el = document.querySelector("._2factor") as HTMLElement;
                                if (el) {
                                  el.style.opacity = "0";
                                  setTimeout(() => {
                                    if (el) el.style.display = "none";
                                    setIsOpen(false); setPassword("")
                                  }, 400);
                                }
                            }}
                          type="button"
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div> */}
    </>
  );
}

export default DropdownAdmin;
