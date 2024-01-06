"use client";
import { useContext, useState, useEffect } from "react";
import NavBar from "../components/home_components/NavBar";
import HeaderBar from "../components/home_components/HeaderBar";
import { useNavContext } from "./context/NavContext";
import { element } from "three/examples/jsm/nodes/Nodes.js";
import { getCookie } from "../components/errorChecks";
import { WebSocketContextProvider } from "@/app/context/WebSocketContext";
import { useWebSocketContext } from "@/app/context/WebSocketContext";
import PrimaryChecks from "../components/PrimaryChecks";
import MobileHeaderBar from "../components/mobile/MobileHeaderBar";
import useMediaQuery from "../Hooks/useMediaQuery";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(min-width: 1366px)");
  const isAuthentacated = true;
  const hover = useNavContext();

  const changeHover = () => {
    const f = document.querySelectorAll(".navigation-bar ul li a");
    f.forEach((d, i) => {
      d.parentElement?.classList?.remove("active");
      if (i.toString() === hover.nav) d.parentElement?.classList.add("active");
      console.log(i.toString(), " ", hover.nav);
    });
  };
  useEffect(() =>{
    changeHover()
  })
  useEffect(() => {
    changeHover();
  }, [hover.nav]);
  useEffect(() => {
    if (!hover.isLoading) {
      const el: HTMLElement | null = document.querySelector(".loading-screen");
      if (el) {
        el.style.opacity = "0";
        const timeid = setTimeout(() => {
          el.style.display = "none";
        }, 700);
        return () => clearTimeout(timeid);
      }
    }
  }, [hover.isLoading]);

  useEffect(() => {
    const element: HTMLElement | null = document.querySelector("#hoverarea");
    if (element) {
      const id = setTimeout(() => {
        element.style.transition = "0.5s";
      }, 700);
      return () => {
        clearTimeout(id);
      };
    }
  }, []);

  return (
    <WebSocketContextProvider>
      <PrimaryChecks></PrimaryChecks>
      <div>
        <div className="loading-screen">
          <div className="loader"></div>
        </div>
        <div className="navbar-overlay"></div>
        <div className="_2factor">
          <img></img>
          <label htmlFor="twofactorcode">Verify your scan :</label>
          <input
            id="twofactorcode"
            onChange={(e) => {
              hover.setTwoFACode(e.target.value);
            }}
            value={hover.TwoFACode}
            type="text"
          ></input>
          <div className="buttons">
            <button
              type="button"
              onClick={async (e) => {
                try {
                  const data = await fetch(
                    `${process.env.API_URL}/user/enable2factor`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("AccessToken")}`,
                      },
                      body: JSON.stringify({ code: hover.TwoFACode }),
                    }
                  );
                  if (data.status == 403) {
                    hover.setIs2FA(false);
                    const el = document.querySelector(
                      "._2factor input"
                    ) as HTMLElement;
                    if (el) el.style.border = "1px red solid";
                    throw new Error("Invalid Code");
                  }
                  const res = await data.json();
                  const el = document.querySelector(
                    "._2factor input"
                  ) as HTMLElement;
                  if (el) {
                    el.style.border = "1px green solid";
                    hover.setIs2FA(true);
                    setTimeout(() => {
                      if (el.parentElement) {
                        el.parentElement.style.animation =
                          "fadeOut 0.3s forwards";
                        setTimeout(() => {
                          if (el.parentElement) {
                            el.parentElement.style.display = "none";
                            el.parentElement.style.animation =
                              "fadeInAnimation 0.5s ease forwards";
                          }
                        }, 400);
                      }
                    }, 1000);
                  }
                } catch (e) {
                  console.log(e);
                }
              }}
              className="verify-btn"
            >
              Verify
            </button>
            <div className="btn-container">
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector("._2factor") as HTMLElement;
                  hover.setIs2FA(false);
                  if (el) {
                    el.style.animation = "fadeOut 0.3s forwards";
                    setTimeout(() => {
                      if (el) el.style.display = "none";
                      el.style.animation = "fadeInAnimation 0.5s ease forwards";
                    }, 400);
                  }
                  hover.setTwoFACode("");
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
         <>
        { isAuthentacated ? (
          <div  className="flex bg-[#1A1C26]">
            {isMobile ? (
              <>
                <div className="w-0 md:w-[126px] h-screen">
                  <NavBar />
                </div>
                <div className="w-full h-screen">
                  <main className="w-full h-auto px-[25px] md:px-[45px] lg:px-[50px] bg-[#1A1C26] overflow-hidden text-white">
                    <HeaderBar />
                    {children}
                  </main>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-full h-screen ">
                  <main className=" w-full h-auto px-[25px] md:px-[45px] lg:px-[50px] bg-[#1A1C26]  text-white space-y-[70px]">
                    <div className="absolute top-0 left-0 right-0 z-50 px-6 ionicon-section">
                      <MobileHeaderBar />
                    </div>
                    {children}
                  </main>
                </div>
              </>
            )}
          </div>

        ) : (
          <div className="bg-[#272932]">
            {children}
          </div>  
          )

        }
        </>
      </div>
    </WebSocketContextProvider>
  );
}
