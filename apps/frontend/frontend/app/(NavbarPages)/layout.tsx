"use client"
import { useContext, useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import { useNavContext } from './context/NavContext';
import { element } from 'three/examples/jsm/nodes/Nodes.js';
import { getCookie } from '../components/errorChecks';
import { WebSocketContextProvider } from '@/app/context/WebSocketContext';
import { useWebSocketContext } from '@/app/context/WebSocketContext';
import PrimaryChecks from '../components/PrimaryChecks';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const hover = useNavContext()
  const changeHover = () => {

    /*const el = e.target as HTMLElement;
    const f = el.parentElement?.parentElement?.parentElement?.querySelectorAll("ion-icon");
    f?.forEach((d, i) => {
      d.parentElement?.classList?.remove("active");
    });
    el.parentElement?.classList.add("active");
    console.log(el);
    hover.setProps(el.getAttribute("data-cory") as string);*/
    //let i: number = 0;
    const f = document.querySelectorAll(".navbar ion-icon");
    f.forEach((d, i) => {
      d.parentElement?.classList?.remove("active");
      if (i.toString() === hover.nav)
        d.parentElement?.classList.add("active");
      console.log(i.toString(), " ", hover.nav)
    });
    /*d.parentElement?.classList.add("active");
    console.log(el);*/
    //hover.setProps(parameter);
  };
  useEffect(() => { changeHover(); }, [hover.nav]);
  useEffect(() => {
    if (!hover.isLoading) {
      const el: HTMLElement | null = document.querySelector(".loading-screen");
      if (el) {
        el.style.opacity = "0"
        const timeid = setTimeout(() => {
          el.style.display = "none"
        }, 700)
        return () => clearTimeout(timeid)
      }
    }
  }, [hover.isLoading]);
  useEffect(() => {
    const element: HTMLElement | null = document.querySelector("#hoverarea");
    if (element) {
      const id = setTimeout(() => {
        element.style.transition = "0.5s"
      }, 700)
      return () => { clearTimeout(id) }
    }
  }, [])
  return (
    <WebSocketContextProvider>
      <PrimaryChecks></PrimaryChecks>
      <div className="container">
        <div className="invite-popup">
        <div className="buttons">
            <button type="button" className="verify-btn">Verify</button>
            <div className="btn-container">
              <button type="button" onClick={() => {
                const el = document.querySelector(".invite-popup") as HTMLElement;
                if (el) {
                  el.style.animation = "fadeOut 0.3s forwards"
                  setTimeout(() => { if (el) el.style.display = "none"; el.style.animation = "fadeInAnimation 0.5s ease forwards" }, 400)
                }
                hover.setTwoFACode("")
              }} className='cancel-btn'>Cancel</button>
            </div>
          </div>
        </div>
        <div className="loading-screen"><div className="loader"></div></div>
        <div className="navbar-overlay"></div>
        <div className="_2factor">
          <img></img>
          <label htmlFor="twofactorcode">Verify your scan :</label>
          <input id="twofactorcode" onChange={(e) => {
            hover.setTwoFACode(e.target.value)
          }} value={hover.TwoFACode} type="text"></input>
          <div className="buttons">
            <button type="button" onClick={async (e) => {
              try {
                const data = await fetch("http://localhost:3001/user/enable2factor", {
                  method: "POST",
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                  },
                  body: JSON.stringify({ code: hover.TwoFACode })
                })
                if (data.status == 403) {
                  hover.setIs2FA(false)
                  const el = document.querySelector("._2factor input") as HTMLElement;
                  if (el)
                    el.style.border = "1px red solid"
                  throw new Error("Invalid Code")
                }
                const res = await data.json()
                const el = document.querySelector("._2factor input") as HTMLElement;
                if (el) {
                  el.style.border = "1px green solid"
                  hover.setIs2FA(true)
                  setTimeout(() => {
                    if (el.parentElement) {
                      el.parentElement.style.animation = "fadeOut 0.3s forwards"
                      setTimeout(() => { if (el.parentElement) { el.parentElement.style.display = "none"; el.parentElement.style.animation = "fadeInAnimation 0.5s ease forwards" } }, 400)
                    }
                  }, 1000)
                }
              }
              catch (e) {
                console.log(e)
              }
            }
            } className="verify-btn">Verify</button>
            <div className="btn-container">
              <button type="button" onClick={() => {
                const el = document.querySelector("._2factor") as HTMLElement;
                hover.setIs2FA(false)
                if (el) {
                  el.style.animation = "fadeOut 0.3s forwards"
                  setTimeout(() => { if (el) el.style.display = "none"; el.style.animation = "fadeInAnimation 0.5s ease forwards" }, 400)
                }
                hover.setTwoFACode("")
              }} className='cancel-btn'>Cancel</button>
            </div>
          </div>
        </div>
        <NavBar />
        {children}
      </div>
    </WebSocketContextProvider>
  )
}
