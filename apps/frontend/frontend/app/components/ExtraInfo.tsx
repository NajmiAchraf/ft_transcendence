import FriendList from './FriendList';
import Channels from './Channels';
import Achievements from './Achievements';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavContext } from '../(NavbarPages)/context/NavContext';
import Settings from './Settings';
type extrainfoprops = {
  changeInfoSec: (index: string) => void;
  infoSec: string;
  userId: number;
};

const ExtraInfo = (props: extrainfoprops) => {
  const nav = useNavContext();
  const [navWidth, setNavWidth] = useState(0);
  /*const navRef = useRef<HTMLDivElement>(null);*/
  /*useEffect(() => {
    if (navRef.current) {
      const itemElements = navRef.current.querySelectorAll('.extra-info nav .item');
      setNavWidth(itemElements.length);
    }
  }, [navRef, nav.id, props.userId]);

  useEffect(() => {
    console.log("OPTION:", navWidth);
  }, [navWidth]);*/
  useEffect(() => {

    if (props.userId == nav.id) {
      console.log("WATAFIN")
      setNavWidth(4)
    }
    else {
      {
        setNavWidth(3)
        nav.setinfoSec("2")
        nav.setNav("0")
      }
      console.log("WATAMAFINCHAHAH")
    }
    console.log("HA NAV WIDTH:", navWidth, " w ha l id :", props.userId)
  }, [props.userId, nav.id])
  useEffect(() => {
    const f = document.querySelectorAll("nav .item");
    f?.forEach((d, i) => {
      d.classList?.remove("active");
      if (i.toString() === nav.infoSec)
        d.classList.add("active")
    });
  }, [nav.infoSec])
  return (
    <div className="pf-section extra-info">
      <nav className={(navWidth === 4 ? "four-items" : "")}>
        <div className="item"><h4 onClick={() => { props.changeInfoSec("0") }}>Achievements</h4></div>
        <div className="item"><h4 onClick={() => { props.changeInfoSec("1") }}>Friend List</h4></div>
        <div className="item"><h4 onClick={() => { props.changeInfoSec("2") }}>Channels</h4></div>
        {(nav.id === props.userId ?
          <div className="item"><h4 onClick={() => { props.changeInfoSec("3") }}>Settings</h4></div> : "")}
        <div className="indicator">
          <div className="bar" style={{ left: `calc(${100 / navWidth}% * ${nav.infoSec})`, width: `calc(${100 / navWidth}%` }}></div>
        </div>
      </nav>
      <div className="ei-content">
        {props.infoSec === "1" ? <FriendList userId={props.userId} /> :
          (props.infoSec === "2" ? <Channels userId={props.userId} /> :
            (props.infoSec === "0" ? <Achievements userId={props.userId} /> : (props.userId === nav.id ? <Settings userId={props.userId} /> : "")))}
      </div>
    </div >
  );
};

export default ExtraInfo;