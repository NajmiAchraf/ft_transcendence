"use client"
import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { getCookie } from "../errorChecks";
import { formatChatDate } from "../errorChecks";
const NotificationBell = ({svg}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null); // Specify the type here
  const [notifications, setNotifications] = useState<any[] | null>(null);
  
  const fetchData = async () => {
    try {
      const data = await fetch(`${process.env.API_URL}/user/notifications`, {
        headers: {
          Authorization: `Bearer ${getCookie("AccessToken")}`
        }
      });

      if (!data.ok) {
        throw new Error("Failed to fetch data");
      }
      const res = await data.json();
      setNotifications(res)
      console.log(notifications);
    } catch (error) {
      console.error("Error fetching data:", error);
      //TokenRefresher();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  function fadeOutNotifications()
  {
    const el = document.querySelector(".notification-section") as HTMLElement
    if (el)
    {
      el.style.animation = "fadeOutDown 0.3s forwards"
      let id = setTimeout((() => {el.style.animation = "fadeInUp 0.3s forwards"; setIsOpen(false);}),400);
    }
  }
  const handleOutsideClick = (event : MouseEvent) => {
    // Check if the click is outside the search-sec div
    if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      fadeOutNotifications()
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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={notificationRef}>
      <button
        className=" flex items-center relative text-gray-500 hover:text-gray-700 focus:outline-none justify-center"
        onClick={async () => {
          await fetchData();
          if (!isOpen)
          {
            setIsOpen(true)
          }else{
            fadeOutNotifications()
          }
        }}
      >
        {svg}
      </button>

      {isOpen && (
        <div className="absolute right-[-17px] top-[40px] w-72 bg-gray-700 border border-gray-900 divide-y divide-gray-400  rounded-[20px] shadow-lg overflow-hidden z-50 notification-section flex flex-col">
          {(notifications && notifications.length > 0 ?
          (notifications.map((notification, i) => (
            <Link href={`/profile/${notification.id}`}
              key={i}
              className={`p-5 ${
                notification.read ? "bg-gray-700 " : "bg-[#272932] "
              }`}
            >
              <p className="text-sm font-medium">{notification.nickname.slice(0, 8)} sent you a request !</p>
              <p className="text-xs text-gray-400">{formatChatDate(new Date(notification.created_at))}</p>
            </Link>
          ))) : <div className="no-notifications">You have no notifications at the moment</div>)}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
