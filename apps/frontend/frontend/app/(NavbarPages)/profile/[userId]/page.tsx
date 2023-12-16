"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import PersonalInfo from '@/app/components/PersonalInfo';
import GlobalChat from '@/app/components/GlobalChat';
import Matches from '@/app/components/Matches';
import ExtraInfo from '@/app/components/ExtraInfo';
import { useNavContext } from '../../context/NavContext';
import { useRouter, useParams } from 'next/navigation'
const Profile = () => {
  const urlParams = useParams()
  const router = useRouter()
  const hover = useNavContext()
  useEffect(
    () => {
      if (hover.infoSec !== "3")
        hover.setNav("3");
    }
    , []);

  const [isAllowed, setisAllowed] = useState(true);
  const changeInfoSec = (index: string) => {
    hover.setinfoSec(index)
    /*let el: HTMLElement | null = e.target as HTMLElement;
    el = el.parentElement;
    const f = document.querySelectorAll("nav .item");
    f?.forEach((d, i) => {
      d.classList?.remove("active");
    });
    el?.classList.add("active");
    hover.setinfoSec(el?.getAttribute("data-index") as string);*/
  };
  return (
    <div className="profile" style={(isAllowed ? {} : { display: "block" })}>
      <PersonalInfo userId={Number(urlParams.userId)} setisAllowed={setisAllowed} />
      {(isAllowed ?
        <>
          <Matches userId={Number(urlParams.userId)} />
          <ExtraInfo changeInfoSec={changeInfoSec} infoSec={hover.infoSec} userId={Number(urlParams.userId)} />
          <GlobalChat userId={Number(urlParams.userId)} />
        </> : <div className="error-section"><img src="/astro.png"></img><h2>Something Went Wrong</h2> <Link href={`/profile/${hover.id}`}>Go back Home <span></span><span></span><span></span><span></span></Link></div>)}
    </div>
  );
};
export default Profile;