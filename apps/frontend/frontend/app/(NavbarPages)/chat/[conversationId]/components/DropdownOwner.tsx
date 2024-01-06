"use client"
import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon  } from '@heroicons/react/20/solid'
import { getCookie } from '@/app/components/errorChecks'
import { useParams, useRouter } from 'next/navigation'
import { useNavContext } from '@/app/(NavbarPages)/context/NavContext'
import Link from 'next/link'
import { div } from 'three/examples/jsm/nodes/Nodes.js'
function classNames(...classes : any) {
  return classes.filter(Boolean).join(' ')
}

function Dropdown({isChannelProtected, getMembers} : {isChannelProtected : boolean | undefined, getMembers :  () => Promise<void>}) {
    const urlParams = useParams()
    const context = useNavContext()
    const router = useRouter()   
    const [password, setPassword] = useState("");
    const [passUpdateState, setPassUpdateState] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const removePassword = async () => {
        try {
            const data = await fetch('http://localhost:3001/chatHttp/removeChannelPassword',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: JSON.stringify({ channelId: Number((urlParams.conversationId as string).slice(0, -("_channel").length)) })
                })
            if (!data.ok) {
                throw new Error("something went wrong")
            }
            await getMembers();
            setPassUpdateState("");
        }
        catch (e) {
        }
    }
    const UpdatePassword = async () => {
        if (password.length <= 1 || passUpdateState.length <= 1)
            return;
        try {
            const data = await fetch(`http://localhost:3001/chatHttp/${passUpdateState}`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: JSON.stringify({ channelId: Number((urlParams.conversationId as string).slice(0, -("_channel").length)), password })
                })
            if (!data.ok) {
                throw new Error("something went wrong")
            }
            await getMembers();
            setPassUpdateState("");
            const el = document.querySelector("._2factor") as HTMLElement;
            if (el) {
              el.style.animation = "fadeOut 0.3s forwards";
              setTimeout(() => {
                if (el) el.style.display = "none";
                el.style.animation = "fadeInAnimation 0.5s ease forwards";
                setIsOpen(false);
                setPassword("");
              }, 400);
            }
        }
        catch (e) {
        }
    }
    const deleteChannel = async () => {
        try {
            const data = await fetch('http://localhost:3001/chatHttp/deleteChannel',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: JSON.stringify({ channelId: Number((urlParams.conversationId as string).slice(0, -("_channel").length)) })
                })
            if (!data.ok) {
                throw new Error("something went wrong")
            }
            router.push(`/chat/${context.id}`)
        }
        catch (e) {
        }
    }
    console.log("isOpen = ", isOpen)
  return (
    <>
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg dark:text-white focus:ring-gray-50 dark:bg-[#272932] dark:hover:bg-gray-700 dark:focus:ring-gray-600">
          <span className="sr-only">Open options</span>
          <EllipsisHorizontalIcon  className="h-6 w-6" aria-hidden="true" />
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
           
            {(isChannelProtected ?
                <>
                <Menu.Item>
                {({ active }) => (
                <button onClick={removePassword}
                    className={classNames(
                    active ? 'rounded-md bg-slate-500 text-white' : 'text-gray-300',
                    'block w-full px-4 text-xs font-extrabold font-Montserrat capitalize leading-[38px]'
                    )}
                >
                    Remove Password
                </button>
                )}
            </Menu.Item>
                <Menu.Item>
                {({ active }) => (
                <button
                    // onClick={() => setPassUpdateState("update")}
                    onClick={() =>{ setPassUpdateState("changeChannelPassword"); setIsOpen(true)}}
                    className={classNames(
                    active ? 'rounded-md bg-slate-500 text-white' : 'text-gray-300',
                    'block w-full px-4 text-xs font-extrabold font-Montserrat capitalize leading-[38px]'
                    )}
                >
                    Change Password
                </button>
                )}
            </Menu.Item>
            </>  
            : 
            <Menu.Item>
              {({ active }) => (
                <button
                onClick={() =>{ setPassUpdateState("addChannelPassword"); setIsOpen(true)}}
                  className={classNames(
                    active ? 'rounded-md bg-slate-500 text-white' : 'text-gray-300',
                    'block w-full px-4 text-xs font-extrabold font-Montserrat capitalize leading-[38px]'
                    )}
                    >
                  Add Password
                </button>
              )}
            </Menu.Item>
            )}
             <Menu.Item>
              {({ active }) => (
                <button onClick={deleteChannel}
                  className={classNames(
                    active ? 'rounded-md bg-red-700 text-white ' : 'text-red-500',
                    'block w-full px-4 text-xs font-extrabold font-Montserrat capitalize leading-[38px]'
                  )}
                >
                  Delete Channel
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
                    <div style={(isOpen ? {display: "flex"} : {})} className="_2factor">
                    <img></img>
                    <label htmlFor="twofactorcode">Update your Password :</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                  </div>
    </>
  )
}

export default Dropdown;
