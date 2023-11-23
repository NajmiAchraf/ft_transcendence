"use client"
import { IonIcon } from '@ionic/react';
import Link from 'next/link';
import * as IonIcons from 'ionicons/icons';
import { useNavContext } from '../(NavbarPages)/context/NavContext';
const NavBar = () => {
  const props = useNavContext()
  return (
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
              <IonIcon data-cory="0" onClick={() => { props.setNav("0") }} icon={IonIcons.home} />
            </li>
            <li>
              <IonIcon data-cory="1" onClick={() => { props.setNav("1"); console.log("hi") }} icon={IonIcons.gameController} />
            </li>
            <li>
              <Link href="/leaderboard">
                <IonIcon data-cory="2" onClick={() => { props.setNav("2") }} icon={IonIcons.clipboard} />
              </Link>
            </li>
            <li>
              <Link href="/profile/1">
                <IonIcon data-cory="3" onClick={() => { props.setNav("3") }} icon={IonIcons.person} />
              </Link>
            </li>
            <li>
              <div className='line'></div>
              <IonIcon data-cory="4" onClick={() => { props.setNav("4") }} icon={IonIcons.settings} />
            </li>
            <div className="hoveredarea" style={{ transform: `translateY(calc( 120px * ${props.nav} - 40px))` }} id="hoverarea"></div>
          </ul>
        </nav>
        <div className='logout'>
          <IonIcon icon={IonIcons.logOut} />
        </div>
      </div>
      <div className="h-bar">
        <div className="search">
          <div className="search-sec">
            <input type='text' placeholder='Search' />
            <IonIcon icon={IonIcons.search} />
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
  );
}

export default NavBar;