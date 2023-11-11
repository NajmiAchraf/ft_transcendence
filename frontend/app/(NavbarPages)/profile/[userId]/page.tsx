"use client"
import { useState } from 'react';
import PersonalInfo from '@/app/components/PersonalInfo';
import GlobalChat from '@/app/components/GlobalChat';
import Matches from '@/app/components/Matches';
import ExtraInfo from '@/app/components/ExtraInfo';
const Profile = () =>{
    const [infoSec, setinfoSec] = useState("0");
    const changeInfoSec= (e : React.MouseEvent<HTMLElement>) =>
    {
      let el : HTMLElement | null = e.target as HTMLElement;
      el = el.parentElement;
      const f = document.querySelectorAll("nav .item");
      f?.forEach((d, i) => {
        d.classList?.remove("active");
      });
      el?.classList.add("active");
      setinfoSec(el?.getAttribute("data-index") as string);
    };
    return (
        <div className="profile">
            <PersonalInfo />
            <Matches />
            <ExtraInfo changeInfoSec={changeInfoSec} infoSec={infoSec} />
            <GlobalChat />
      </div>
    );
};
export default Profile;