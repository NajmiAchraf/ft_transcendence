"use client"
import { useState } from 'react'
import NavBar from '../components/NavBar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const [hover, setHover] = useState("0");
    const changeHover= (e : React.MouseEvent<HTMLElement>) =>
    {
      const el = e.target as HTMLElement;
      const f = el.parentElement?.parentElement?.parentElement?.querySelectorAll("ion-icon");
      f?.forEach((d, i) => {
        d.parentElement?.classList?.remove("active");
      });
      el.parentElement?.classList.add("active");
      console.log(el);
      setHover(el.getAttribute("data-cory") as string);
    };
  return (
      <div className="container">
        <NavBar hoverfunc={changeHover} hover={hover} />
        {children}
      </div>
  )
}
