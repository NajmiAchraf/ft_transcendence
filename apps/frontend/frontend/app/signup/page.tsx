"use client";
import { useRouter } from "next/navigation";
import { deleteCookie, getCookie, ExpirationDate } from "../components/errorChecks";
import React, { useState, useEffect } from "react";
import { error } from "console";
const Signup = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const SignupFunction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.API_URL}/auth/local/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok)
      {
        if (res.status == 400)
          setError("Invalid Password Or Username !");
        else if (res.status == 403)
          setError("UserName Already Exists !");
        throw new Error("SOMETHING WENT WRONG");
      }
      const data = await res.json();
      deleteCookie("AccessToken");
      deleteCookie("RefreshToken");
      document.cookie = `RefreshToken=${data.refreshToken}; expires=${ExpirationDate(7)}; path=/`;
      document.cookie = `AccessToken=${data.accessToken}; expires=${ExpirationDate(1)}; path=/`;
      router.push("/complete_infos");
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (error.length > 0) {
      setTimeout(() => {
        const el = document.querySelector(".Error-message") as HTMLElement;
        if (el) {
          el.style.animation = "fadeOutTop 0.5s forwards";
          setTimeout(() => {
            el.style.animation = "fadeInTop 0.5s forwards";
            setError("");
          }, 500);
        }
      }, 2000);
    }
  }, [error]);
  const SigninFunction = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      console.log("hi");
      const res = await fetch(`${process.env.API_URL}/auth/local/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok)
      {
        if (res.status == 400 || res.status == 403)
          setError("Invalid Password Or Username !");
        throw new Error("SOMETHING WENT WRONG");
      }
      const data = await res.json();
      deleteCookie("AccessToken");
      deleteCookie("RefreshToken");
      document.cookie = `RefreshToken=${data.refreshToken}; expires=${ExpirationDate(7)}; path=/`;
      document.cookie = `AccessToken=${data.accessToken}; expires=${ExpirationDate(1)}; path=/`;
      router.push("/home");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="relative flex w-[100%] h-screen  text-white bg-[#272932]">
      <div className="absolute top-0 left-0">logo</div>
      {error ?(
      <div className="Error-message">
        {error}
      </div>
      ) : ""}
      <div className="grid w-screen items-center place-content-center  gap-y-8 lg:w-[50%]">
        <div className="">
          <div className="font-Montserrat font-bold text-white text-[22px] leading-[37.4px] ">
            Welcome to Ping Pong Showdown!
          </div>
          <p className="  font-Montserrat font-light text-[#ffffffcc] text-[14px] leading-[23.8px] ">
            Ready to jump into the action? Choose your preferred method to get
            in the game.
          </p>
        </div>
        <div>
          <form onSubmit={SignupFunction} className="space-y-6 w-full">
            <label
              htmlFor="username"
              className="font-Montserrat font-medium leading-7 text-gray-200 text-[16px] px-3 "
            >
              Username
            </label>
            <div className="relative flex items-center space-x-2">
              <div className=" absolute pointer-events-none px-[25px] py-[1px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="18"
                  viewBox="0 0 15 18"
                  fill="none"
                >
                  <path
                    d="M7.48457 11.3361C11.218 11.3361 14.3686 11.9428 14.3686 14.2834C14.3686 16.6248 11.1973 17.21 7.48457 17.21C3.75205 17.21 0.600586 16.6033 0.600586 14.2627C0.600586 11.9213 3.77185 11.3361 7.48457 11.3361ZM7.48457 0C10.0137 0 12.04 2.02563 12.04 4.55294C12.04 7.08025 10.0137 9.10674 7.48457 9.10674C4.95634 9.10674 2.92911 7.08025 2.92911 4.55294C2.92911 2.02563 4.95634 0 7.48457 0Z"
                    fill="#8F8F8F"
                  />
                </svg>
              </div>
              <input
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Please Enter your Email"
                name="username"
                type="text"
                autoComplete="off"
                required
                className=" w-full h-[62px] bg-[#1a1c26] rounded-[15px] text-sm  px-[50px] focus:ring-[#D75433]  focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="font-Montserrat font-medium text-[#ebebeb] text-[16px] leading-[28px] px-3"
              >
                Password
              </label>
              <div className="relative flex items-center space-x-2">
                <div className="absolute pointer-events-none px-[25px] ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="20"
                    viewBox="0 0 16 20"
                    fill="none"
                  >
                    <path
                      d="M7.79526 0.548828C9.97202 0.548828 11.8956 1.89962 12.6056 3.90057C12.6804 4.10259 12.6617 4.32298 12.5683 4.51582C12.4748 4.70866 12.3076 4.85558 12.1011 4.92078C11.6807 5.06679 11.2136 4.84732 11.0548 4.42491C10.5783 3.06493 9.27135 2.15583 7.81394 2.15583C5.90717 2.15583 4.36661 3.66273 4.35634 5.50757V6.74725L4.34513 6.74909H11.705C13.8725 6.74909 15.6297 8.47638 15.6297 10.6068V15.1688C15.6297 17.2993 13.8725 19.0266 11.705 19.0266H3.92379C1.7573 19.0266 0 17.2993 0 15.1688V10.6068C0 8.85471 1.19582 7.39189 2.82326 6.92172L2.72143 6.93366V5.52593C2.74011 2.78118 5.01124 0.548828 7.79526 0.548828ZM7.8102 11.065C7.36177 11.065 6.99742 11.4232 6.99742 11.8639V13.9025C6.99742 14.3525 7.36177 14.7106 7.8102 14.7106C8.26798 14.7106 8.63233 14.3525 8.63233 13.9025V11.8639C8.63233 11.4232 8.26798 11.065 7.8102 11.065Z"
                      fill="#717274"
                    />
                  </svg>
                </div>
                <input
                  id="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Please Enter your Password"
                  name="Password"
                  type="Password"
                  required
                  className="w-full h-[62px] bg-[#1a1c26] rounded-[15px] sm:text-sm  px-[50px] focus:outline-none focus:ring-[#D75433] focus:ring-2"
                />
              </div>
            </div>
            <div className="flex justify-between gap-8 px-5">
              <button
                type="button"
                onClick={SigninFunction}
                className="w-full h-[53px] rounded-[15px] shadow-md transition-all duration-500 bg-gradient-to-l to-[#412170] via-[#d75433]  from-[#412170] bg-size-200 bg-pos-10 hover:bg-pos-100"
              >
                Login
              </button>
              <button
                type="submit"
                className="w-full h-[53px] rounded-[15px] shadow-md transition-all duration-500 bg-gradient-to-l to-[#d75433] via-[#412170]  from-[#d75433] to-[#412170] bg-size-200 bg-pos-0 hover:bg-pos-100"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
        <div className=" divider mx-48 text-[15px] font-light">OR</div>
        <div className="flex flex-col gap-[19px] justify-items-center items-center">
          <button
            onClick={() => {
              router.push("http://localhost:3001/auth/intra/redirect");
            }}
            className="flex items-center justify-center gap-[15px] relative w-full h-[53px] rounded-[15px] shadow-xl  transition-all duration-500 bg-gradient-to-l to-[#d75433] via-[#412170]  from-[#d75433] to-[#412170] bg-size-200 bg-pos-0 hover:bg-pos-100"
          >
            <svg
              width="30"
              height="24"
              viewBox="0 0 30 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Group">
                <path
                  id="Vector"
                  d="M5.52321 6.29123L0 12.5794V15.1349V17.6874H5.53125H11.0625V20.8437V24L13.8161 23.9939L16.567 23.9848L16.575 18.2882L16.5804 12.5947H11.0571H5.53125L8.66518 9.01753C10.3902 7.05362 12.8705 4.21754 14.183 2.7202L16.567 -1.38405e-07H13.808H11.0491L5.52321 6.29123Z"
                  fill="white"
                />
                <path
                  id="Vector_2"
                  d="M18.9365 3.141C18.9365 4.86705 18.9446 6.28204 18.9526 6.28204C18.9606 6.28204 20.2008 4.87315 21.7088 3.1471L24.4517 0.0152084L24.4544 3.1715V6.32779L21.6955 9.46883L18.9365 12.6099V15.7418V18.8767H21.6955H24.4544V15.7418V12.6099L27.2267 9.45358L29.999 6.29729V3.15015V-3.93591e-05H24.4678H18.9365V3.141Z"
                  fill="white"
                />
                <path
                  id="Vector_3"
                  d="M27.2277 15.7357L24.4688 18.8767H27.2357H30V15.7357C30 14.0066 29.9973 12.5946 29.992 12.5946C29.9893 12.5946 28.7437 14.0066 27.2277 15.7357Z"
                  fill="white"
                />
              </g>
            </svg>
            <div className="relative w-fit font-Inter font-black text-white text-[18px] text-center leading-[22.1px] whitespace-nowrap">
              CONTINUE WITH 42
            </div>
          </button>
          {/*<button className="flex items-center justify-center gap-[15px] relative w-full h-[53px] rounded-[15px] transition-all shadow-xl duration-500 bg-gradient-to-r to-[#d75433] via-[#412170]  from-[#d75433] to-[#412170] bg-size-200 bg-pos-0 hover:bg-pos-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="25"
              viewBox="0 0 32 25"
              fill="none"
            >
              <path
                d="M27.0893 2.02188C25.0498 1.08605 22.8626 0.396559 20.5758 0.0016555C20.5342 -0.00596321 20.4926 0.0130836 20.4712 0.0511771C20.1899 0.551473 19.8783 1.20414 19.6601 1.71714C17.2005 1.3489 14.7536 1.3489 12.3444 1.71714C12.1262 1.19271 11.8033 0.551473 11.5208 0.0511771C11.4993 0.0143534 11.4577 -0.00469342 11.4161 0.0016555C9.13056 0.395289 6.94341 1.08478 4.90258 2.02188C4.88492 2.0295 4.86979 2.0422 4.8597 2.05871C0.71119 8.25653 -0.425267 14.302 0.13224 20.2725C0.134763 20.3017 0.15116 20.3297 0.173864 20.3474C2.91095 22.3575 5.56226 23.5778 8.16438 24.3866C8.206 24.3993 8.25015 24.3841 8.27664 24.3498C8.89216 23.5092 9.44084 22.6229 9.91132 21.6909C9.93907 21.6363 9.91258 21.5715 9.85582 21.5499C8.9855 21.2198 8.15681 20.8172 7.35965 20.3601C7.29658 20.3233 7.29154 20.2331 7.34956 20.19C7.51732 20.0643 7.68507 19.9335 7.84526 19.8014C7.87427 19.7773 7.91464 19.7722 7.94869 19.7875C13.1857 22.1785 18.8554 22.1785 24.0306 19.7875C24.0647 19.7709 24.105 19.776 24.1353 19.8001C24.2955 19.9322 24.4633 20.0643 24.6323 20.19C24.6903 20.2331 24.6865 20.3233 24.6234 20.3601C23.8263 20.8261 22.9976 21.2198 22.126 21.5486C22.0693 21.5702 22.044 21.6363 22.0718 21.6909C22.5523 22.6216 23.101 23.5079 23.7052 24.3485C23.7304 24.3841 23.7758 24.3993 23.8175 24.3866C26.4322 23.5778 29.0835 22.3575 31.8206 20.3474C31.8446 20.3297 31.8597 20.303 31.8622 20.2738C32.5295 13.3712 30.7447 7.3753 27.131 2.05998C27.1221 2.0422 27.107 2.0295 27.0893 2.02188ZM10.6933 16.6371C9.11668 16.6371 7.81751 15.1896 7.81751 13.4119C7.81751 11.6342 9.09145 10.1866 10.6933 10.1866C12.3078 10.1866 13.5944 11.6469 13.5692 13.4119C13.5692 15.1896 12.2952 16.6371 10.6933 16.6371ZM21.3263 16.6371C19.7497 16.6371 18.4505 15.1896 18.4505 13.4119C18.4505 11.6342 19.7244 10.1866 21.3263 10.1866C22.9408 10.1866 24.2274 11.6469 24.2022 13.4119C24.2022 15.1896 22.9408 16.6371 21.3263 16.6371Z"
                fill="white"
              />
            </svg>
            <div className="relative w-fit font-Inter font-black text-white text-[18px] text-center leading-[22.1px] whitespace-nowrap ">
              CONTINUE WITH DISCORD
            </div>
          </button>*/}
        </div>
      </div>
      <div className=" hidden lg:flex w-[50%] ">
        <img
          src="/imgR.png"
          alt="pic"
          className="object-cover w-full h-full shadow-inner"
        />
      </div>
    </div>

    // <>
    //     <a href="http://localhost:3001/auth/intra/redirect">intra</a>
    // </>
  );
};

export default Signup;
