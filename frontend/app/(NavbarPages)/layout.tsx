"use client"
import { useContext, useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import { useNavContext } from './context/NavContext';
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
    f?.forEach((d, i) => {
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
  return (
    <div className="container">
      <div className="loading-screen"><div className="loader"></div></div>
      <div className="navbar-overlay"></div>
      <NavBar />
      {children}
    </div>
  )
}
