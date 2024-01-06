"use client";

import { useEffect, useRef, useState } from "react";
import { getCookie } from "../components/errorChecks";
// import { TokenRefresher } from "../components/errorChecks";
import { useRouter } from "next/navigation";
const CompleteInfos = () => {
  const router = useRouter();
  const [error, setError] = useState("");
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

  const submitinfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(
      document.getElementById("extrainfo") as HTMLFormElement
    );
    console.log(formData)
    formData.forEach((key, value) => {
      console.log(key, " : ", value);
    });
    const avatarInput = formData.get("avatar") as File;
    if (avatarInput.name.length <= 0) {
      // If no file is selected, set a default avatar
      const defaultAvatarUrl = "/3ziya.png"; // Replace with the actual path to your default avatar image
      const defaultAvatarBlob = await fetch(defaultAvatarUrl).then((res) => res.blob());
    
      const defaultAvatarFile = new File([defaultAvatarBlob], "default-avatar.png", { type: "image/png" });
    
      // Append the default avatar to the FormData
      formData.append("avatar", defaultAvatarFile);
    }

    try {
      const data = await fetch("http://localhost:3001/user/info", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("AccessToken")}`,
        },
        body: formData,
      });
      if (!data.ok) {
        console.log(await data.text())
        if (data.status == 401) {
          // TokenRefresher();
        }
        else if(data.status == 413)
          setError("Image Size Is Too Large.")
        else if(data.status == 400 || data.status == 500)
          setError("Invalid Personal Information.")
        else if (data.status == 403)
          setError("A User With Those Information Already Exists.")
        throw new Error("something went wrong");
      }

      const res = await data.json();
      router.push(`/profile/${res.id}`);
    } catch (e) {
      console.log(e);
    }
  };

  const loadFile = function (event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (file) {
      const output = document.getElementById('img_preview') as HTMLImageElement | null;
      if (output) {
        output.src = URL.createObjectURL(file);
        output.onload = function () {
          URL.revokeObjectURL(output.src); // free memory
        };
      }
    }
  };

  const avatar = useRef<File | undefined>(undefined)
  const [path, setPath] = useState("/3ziya.png")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      avatar.current = e.target.files[0];
      try {
        const path = URL.createObjectURL(avatar.current);
        setPath(path);
      } catch (error) {
        console.error('Error creating URL:', error);
      }
    }
  };

  return (
    <div className="relative flex w-[100%]  h-screen  text-white bg-[#272932]">
      {error ?(
      <div className="Error-message">
        {error}
      </div>
      ) : ""}
      <div className=" hidden lg:flex w-[50%] ">
        <img
          src="/left.png"
          alt="pic"
          className="object-cover w-full h-full shadow-inner"
        />
      </div>
      <div className="grid w-screen items-center place-content-center  gap-y-8 lg:w-[50%]">
        <div>
          <div className="font-Montserrat font-bold text-white text-[22px] leading-[37.4px] ">
            Welcome to Ping Pong Showdown!
          </div>
          <p className="  font-Montserrat font-light text-[#ffffffcc] text-[14px] leading-[23.8px] ">
            Ready to jump into the action? Choose your preferred method to get
            in the game.
          </p>
        </div>
        <div>
          <form
            action=""
            className="space-y-6 w-full"
            onSubmit={submitinfo}
            id="extrainfo"
          >
            <div>
              <label
                htmlFor="uploadImage"
                className="cursor-pointer flex relative place-content-center w-fit mx-auto"
              >
                <div className=" h-[182px] w-[182px] rounded-full bg-contain">
                  <img
                    id="img_preview"
                    src={path}
                    alt="profile"
                    className=" w-full h-full rounded-full "
                  />
                </div>
                <svg
                 className = "absolute items-center h-6 w-6 top-[50%]"
                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" >
                  <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                  <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>

              </label>
              <input
                // onChange={loadFile}
                onChange={handleImageChange}
                className="hidden"
                id="uploadImage"
                accept="image/*"
                type="file"
                name="avatar"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="font-Montserrat font-medium text-[#ebebeb] text-[16px] leading-[28px] px-3 mb-4"
              >
                Nick Name
              </label>
              <div className="relative flex items-center space-x-2">
                <div className="absolute pointer-events-none px-[25px] ">
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
                  id="nickname"
                  placeholder="Please Enter your nickname"
                  name="nickname"
                  type="text"
                  required
                  className="w-full h-[62px] bg-[#1a1c26] rounded-[15px] sm:text-sm  px-[50px] focus:outline-none focus:ring-[#D75433] focus:ring-2"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="font-Montserrat font-medium text-[#ebebeb] text-[16px] leading-[28px] px-3"
              >
                Full Name
              </label>
              <div className="relative flex items-center space-x-2">
                <div className="absolute pointer-events-none px-[25px] ">
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
                  id="fullname"
                  placeholder="Please Enter your Full Name"
                  name="fullname"
                  type="text"
                  required
                  className="w-full h-[62px] bg-[#1a1c26] rounded-[15px] sm:text-sm  px-[50px] focus:outline-none focus:ring-[#D75433] focus:ring-2"
                />
              </div>
            </div>
            <div>
              <label className="font-Montserrat font-medium text-[#ebebeb] text-[16px] leading-[28px] px-3">
                Gender
              </label>
              <div className="relative flex items-center ">
                <select
                  className="pl-[10px] w-full h-[62px] bg-[#1a1c26] rounded-[15px] sm:text-sm focus:outline-none focus:ring-[#D75433] focus:ring-2"
                  id="grid-state"
                  name="gender"
                >
                  <option className="font-Montserrat font-medium text-[#bfbfbf] text-[12px] leading-[28px] px-3">
                    female
                  </option>
                  <option className="font-Montserrat font-medium text-[#bfbfbf] text-[12px] leading-[28px] px-3">
                    male
                  </option>
                </select>
                <div className="absolute right-[3px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="9"
                    height="7"
                    viewBox="0 0 9 7"
                    fill="none"
                  >
                    <path
                      d="M3.4083 6.74155C3.3677 6.702 3.1941 6.55265 3.0513 6.41354C2.1532 5.59795 0.6832 3.47034 0.2345 2.35675C0.1624 2.18763 0.0098 1.76006 0 1.53161C0 1.31271 0.0504 1.10404 0.1526 0.90492C0.2954 0.656698 0.5201 0.457574 0.7854 0.348466C0.9695 0.278227 1.5204 0.169118 1.5302 0.169118C2.1329 0.0600097 3.1122 0 4.1944 0C5.2255 0 6.1649 0.0600097 6.7767 0.149342C6.7865 0.159571 7.4711 0.26868 7.7056 0.388018C8.134 0.606917 8.4 1.03449 8.4 1.49206V1.53161C8.3895 1.82962 8.1235 2.45631 8.1137 2.45631C7.6643 3.50989 6.2664 5.58841 5.3375 6.42377C5.3375 6.42377 5.0988 6.65904 4.9497 6.76132C4.7355 6.9209 4.4702 7 4.2049 7C3.9088 7 3.633 6.91067 3.4083 6.74155Z"
                      fill="#8F8F8F"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* <div>
              <label className="font-Montserrat font-medium text-[#ebebeb] text-[16px] leading-[28px] px-3">
                Birthday
              </label>
              <div>
                <input
                  className=" left-0 w-full h-[62px] bg-[#1a1c26] text-[#bfbfbf]  rounded-[15px] sm:text-sm  px-[50px] focus:outline-none focus:ring-[#D75433] focus:ring-2"
                  type="date"
                  id="birthday"
                  name="birthday"
                />
              </div>
            </div> */}
            <div>
              <button
                type="submit"
                className="w-full mt-8 h-[53px] font-bold rounded-[15px] shadow-md bg-gradient-to-r from-[#d75433] to-[#412170] text-white"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteInfos;


