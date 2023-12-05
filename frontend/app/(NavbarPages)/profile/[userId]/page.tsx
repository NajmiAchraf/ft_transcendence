"use client"
import { useState, useEffect } from 'react';
import PersonalInfo from '@/app/components/PersonalInfo';
import GlobalChat from '@/app/components/GlobalChat';
import Matches from '@/app/components/Matches';
import ExtraInfo from '@/app/components/ExtraInfo';
import { useNavContext } from '../../context/NavContext';
const Profile = () => {
  const hover = useNavContext()
  useEffect(
    () => {
      hover.setNav("3");
      const myid: NodeJS.Timeout = setTimeout(() => { hover.setIsLoading(false); }, 500);
      return () => clearTimeout(myid);
    }
    , []);

  const [infoSec, setinfoSec] = useState("0");
  const changeInfoSec = (e: React.MouseEvent<HTMLElement>) => {
    let el: HTMLElement | null = e.target as HTMLElement;
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