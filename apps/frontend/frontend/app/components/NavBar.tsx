"use client"
import { deleteCookie } from './errorChecks';
import { IonIcon } from '@ionic/react';
import Link from 'next/link';
import * as IonIcons from 'ionicons/icons';
import { useNavContext } from '../(NavbarPages)/context/NavContext';
import { useParams, useRouter } from 'next/navigation';
import {useEffect, useState, useRef } from 'react';
import { getCookie } from './errorChecks';
import { LogOut } from './errorChecks';
import { whoami } from './PersonalInfo';
import { useWebSocketContext } from '../context/WebSocketContext';
import InvitePopUp from './InvitePopUp';
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
  const [isPageVisible, setIsPageVisible] = useState(true);
  const searchSecRef = useRef<HTMLDivElement>(null); // Specify the type here

  const handleVisibilityChange = () => {
    setIsPageVisible(!document.hidden);
  };

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  useEffect(() => {
    const localwhoami = async () => {
      const id = await whoami()
      context.setId(id)
    }
    localwhoami()
    const handleInvite = async (event : any) =>{
      if (event.receiver_id === await whoami())
      {
        setSenderId(event.sender_id)
        context.setisCountDown(true)
      }
    }

    const handleAccept = async (event : any) =>{
      const id = await whoami()
      if ((event.receiver_id === id || event.sender_id === id) && isPageVisible)
        router.push("/ping-pong/invite")
    }
    wsProvider.chat.on("sendGameInvitation", handleInvite)
    wsProvider.chat.on("gameInvitationAccepted", handleAccept)

  }, []);

  const showSearch = (option: number) => {
    let element: HTMLElement | null = document.querySelector(".navbar-overlay")
    let element2: HTMLElement | null = document.querySelector(".search-results")
    let element3: HTMLElement | null = document.querySelector(".search-sec")
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
  const [inputValue, setInputValue] = useState<string>("");
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    console.log(typeof (inputValue))
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
  return (
    <>
      {( context.isCountDown ? 
            <InvitePopUp senderId={SenderId}/>: "")}
      <header>
        <div className="hidden-logo">
          <h1>PONG</h1>
        </div>
        <div className='navbar'>
          <div className="logo">
            <h1>PONG</h1>
          </div>
          <nav>
            <ul>
              <li className="active">
                <IonIcon onClick={() => { context.setNav("0") }} icon={IonIcons.home} />
              </li>
              <li>
                <Link onClick={() => { context.setNav("1"); }} href={`/chat/${context.id}`} className="chat-icon">
                  <IonIcon icon={IonIcons.chatbubbleEllipses} />
                </Link>
              </li>
              <li>
                <Link onClick={() => { context.setNav("2") }} href="/leaderboard">
                  <IonIcon icon={IonIcons.clipboard} />
                </Link>
              </li>
              <li>
                <Link onClick={() => { context.setNav("3") }} href={`/profile/${context.id}`}>
                  <IonIcon icon={IonIcons.person} />
                </Link>
              </li>
              <li>
                <Link onClick={() => {
                  if (context.infoSec !== "3")
                    context.setinfoSec("3");
                  context.setNav("4")
                  const f = document.querySelectorAll("nav .item");
                  f?.forEach((d, i) => {
                    d.classList?.remove("active");
                    if (i == 3)
                      d.classList?.add("active")
                  });
                }} href={`/profile/${context.id}`}>
                  <IonIcon icon={IonIcons.settings} />
                </Link>
              </li>
              <div className="hoveredarea" style={{ transform: `translateY(calc( 120px * ${context.nav} - 40px))` }} id="hoverarea"></div>
            </ul>
          </nav>
          <div className='logout'>
            <IonIcon onClick={async () =>{
                  try {
                    const data = await fetch("http://localhost:3001/auth/logout",
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

            }} icon={IonIcons.logOut} />
          </div>
        </div>
        <div className="h-bar">
          <div className="search">
            <div className="search-sec" ref={searchSecRef}>
              <input type='text' onChange={handleInputChange} onFocus={() => showSearch(1)} placeholder='Search' />
              <IonIcon icon={IonIcons.search} />
              <div className="search-results" style={(users && users.length !== 0 ? { justifyContent: "flex-start" } : {})}>
                {(users ?
                  (users.length !== 0 ? users.map((user: any) => (
                    <div className="search-user" key={user.id}>
                      <img src={user.avatar} /> <h5 onClick={() =>{showSearch(0); router.push(`/profile/${user.id}`)}}>{user.nickname}</h5>
                    </div>
                  )) : <div>No results were found</div>) : <div>Search for users</div>)}
              </div>
            </div>
            <div className="profile-sec">
              <div className="notification">
                <IonIcon icon={IonIcons.notifications} />
              </div>
              <img src="/img.png" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default NavBar;