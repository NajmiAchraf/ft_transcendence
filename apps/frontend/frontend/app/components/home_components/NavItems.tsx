"use client"
import React from "react";
import { IonIcon } from '@ionic/react';
import Link from 'next/link';
import * as IonIcons from 'ionicons/icons';
import { useNavContext } from "@/app/(NavbarPages)/context/NavContext";
function NavItems() {
  const context = useNavContext()
  return (
    <div className="relative flex flex-col justify-between space-y-[82px] place-content-center items-center ">
      {/*<div className="w-[114px] h-[76px] absolute">
            <div className=" w-[30px] h-[30px] bg-[#1B1D23] absolute left-24 top-[60px] rounded-3xl"/>
            <div className=" w-[130px] h-[76px]   bg-[#1B1D23] rounded-[61px]" />
  </div>*/}
        <nav className="navigation-bar">
            <ul>
              <li>
              <Link onClick={() => { context.setNav("0") }} href="/home">
                <svg 
                className="z-50"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="23"
                viewBox="0 0 22 23"
                fill="none"
              >
                <path
                  fill="#8F8F8F"
                  d="M7.49621 21.2108V17.7561C7.49621 16.8742 8.21636 16.1592 9.1047 16.1592H12.352C12.7786 16.1592 13.1878 16.3275 13.4894 16.6269C13.7911 16.9264 13.9605 17.3326 13.9605 17.7561V21.2108C13.9579 21.5774 14.1027 21.93 14.3629 22.1902C14.6231 22.4504 14.9772 22.5967 15.3465 22.5967H17.562C18.5967 22.5994 19.5899 22.1932 20.3225 21.4678C21.0551 20.7424 21.4669 19.7574 21.4669 18.7302V8.88825C21.4669 8.0585 21.0964 7.27144 20.4552 6.73909L12.9186 0.76362C11.6075 -0.284084 9.72914 -0.250256 8.45726 0.843963L1.09256 6.73909C0.421135 7.25575 0.0198312 8.04515 0 8.88825V18.7202C0 20.8611 1.74829 22.5967 3.90491 22.5967H6.0698C6.83689 22.5967 7.4603 21.9823 7.46586 21.2208L7.49621 21.2108Z"
                />
              </svg>
            </Link>
              </li>
              <li>
                <Link onClick={() => { context.setNav("1"); }} href={`/chat/${context.id}`}>
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.525 0C19.625 0 25 5.82123 25 12.4812C25 20.2053 18.7 25 12.5 25C10.45 25 8.175 24.4492 6.35 23.3726C5.7125 22.9845 5.175 22.6965 4.4875 22.9219L1.9625 23.673C1.325 23.8733 0.75 23.3726 0.9375 22.6965L1.775 19.8923C1.9125 19.5043 1.8875 19.0911 1.6875 18.7656C0.6125 16.7877 0 14.6219 0 12.5188C0 5.9339 5.2625 0 12.525 0ZM18.2375 10.9289C17.35 10.9289 16.6375 11.6425 16.6375 12.5313C16.6375 13.4076 17.35 14.1337 18.2375 14.1337C19.125 14.1337 19.8375 13.4076 19.8375 12.5313C19.8375 11.6425 19.125 10.9289 18.2375 10.9289ZM12.475 10.9289C11.6 10.9164 10.875 11.6425 10.875 12.5188C10.875 13.4076 11.5875 14.1212 12.475 14.1337C13.3625 14.1337 14.075 13.4076 14.075 12.5313C14.075 11.6425 13.3625 10.9289 12.475 10.9289ZM6.7125 10.9289C5.825 10.9289 5.1125 11.6425 5.1125 12.5313C5.1125 13.4076 5.8375 14.1337 6.7125 14.1337C7.6 14.1212 8.3125 13.4076 8.3125 12.5313C8.3125 11.6425 7.6 10.9289 6.7125 10.9289Z" fill="#8F8F8F"/>
</svg>
              </Link>
              </li>
              <li>
                <Link onClick={() => { context.setNav("2") }} href="/leaderboard">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  viewBox="0 0 23 23"
                  fill="none"
                >
                  <path
                    d="M16.8694 0C20.7805 0 22.9885 2.21835 23 6.1295V16.8705C23 20.7805 20.7805 23 16.8694 23H6.1295C2.21835 23 0 20.7805 0 16.8705V6.1295C0 2.21835 2.21835 0 6.1295 0H16.8694ZM12.075 4.7495C11.7519 4.554 11.3609 4.554 11.0515 4.7495C10.7399 4.94385 10.5685 5.3015 10.6019 5.658V17.3765C10.6605 17.871 11.0734 18.239 11.5564 18.239C12.052 18.239 12.4649 17.871 12.5109 17.3765V5.658C12.5569 5.3015 12.3855 4.94385 12.075 4.7495ZM6.7045 8.5215C6.394 8.326 6.00185 8.326 5.6925 8.5215C5.38085 8.717 5.2095 9.07235 5.244 9.43V17.3765C5.28885 17.871 5.70285 18.239 6.19735 18.239C6.693 18.239 7.10585 17.871 7.15185 17.3765V9.43C7.1875 9.07235 7.01385 8.717 6.7045 8.5215ZM17.3524 12.696C17.043 12.5005 16.652 12.5005 16.33 12.696C16.0184 12.8915 15.847 13.2354 15.893 13.6045V17.3765C15.939 17.871 16.3519 18.239 16.8475 18.239C17.3305 18.239 17.7434 17.871 17.802 17.3765V13.6045C17.8354 13.2354 17.664 12.8915 17.3524 12.696Z"
                    fill="#8F8F8F"
                  />
                </svg>
                </Link>
              </li>
              <li>
                <Link onClick={() => { context.setNav("3") }} href={`/profile/${context.id}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="24"
                  viewBox="0 0 20 24"
                  fill="none"
                >
                  <path
                    d="M9.78264 15.416C14.8596 15.416 19.1441 16.241 19.1441 19.4239C19.1441 22.608 14.8315 23.4037 9.78264 23.4037C4.7068 23.4037 0.421143 22.5788 0.421143 19.3958C0.421143 16.2117 4.73373 15.416 9.78264 15.416ZM9.78264 0C13.2219 0 15.9776 2.75465 15.9776 6.19152C15.9776 9.6284 13.2219 12.3842 9.78264 12.3842C6.34451 12.3842 3.58769 9.6284 3.58769 6.19152C3.58769 2.75465 6.34451 0 9.78264 0Z"
                    fill="#8F8F8F"
                  />
                </svg>
                </Link>
              </li>
              <li>
                <Link style={{pointerEvents : "none"}} href="">
                <div className=" w-[60px] h-[1px] bg-[#8F8F8F]"/>
                </Link>
              </li>
              <li>
                <Link onClick={() => {
                  if (context.infoSec !== "3")
                    context.setinfoSec("3");
                  context.setNav("5")
                  const f = document.querySelectorAll("nav .item");
                  f?.forEach((d, i) => {
                    d.classList?.remove("active");
                    if (i == 3)
                      d.classList?.add("active")
                  });
                }} href={`/profile/${context.id}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                  >
                    <path
                      d="M12.5725 0.914246C13.4719 0.914246 14.2862 1.41375 14.7359 2.15112C14.9547 2.50791 15.1006 2.94795 15.0641 3.41178C15.0398 3.76857 15.1492 4.12536 15.3436 4.45836C15.9635 5.46927 17.3369 5.84984 18.4065 5.27898C19.6098 4.58919 21.129 5.00544 21.8218 6.18285L22.6361 7.58622C23.3411 8.76363 22.9521 10.274 21.7367 10.9519C20.7036 11.5585 20.339 12.9024 20.9589 13.9252C21.1533 14.2463 21.3721 14.5198 21.7124 14.6863C22.1378 14.9123 22.466 15.2691 22.6969 15.6259C23.1466 16.3633 23.1101 17.2671 22.6726 18.064L21.8218 19.4911C21.3721 20.2523 20.5335 20.728 19.6705 20.728C19.2451 20.728 18.7711 20.6091 18.3822 20.3712C18.0662 20.169 17.7015 20.0977 17.3126 20.0977C16.1094 20.0977 15.1006 21.0848 15.0641 22.2622C15.0641 23.6299 13.9459 24.7003 12.5482 24.7003H10.8952C9.48534 24.7003 8.36716 23.6299 8.36716 22.2622C8.34285 21.0848 7.33406 20.0977 6.1308 20.0977C5.72971 20.0977 5.36509 20.169 5.06123 20.3712C4.6723 20.6091 4.18614 20.728 3.7729 20.728C2.8978 20.728 2.05916 20.2523 1.60946 19.4911L0.770821 18.064C0.321117 17.2909 0.296809 16.3633 0.746512 15.6259C0.940979 15.2691 1.3056 14.9123 1.71884 14.6863C2.05916 14.5198 2.27794 14.2463 2.48456 13.9252C3.09226 12.9024 2.72764 11.5585 1.69454 10.9519C0.491275 10.274 0.102342 8.76363 0.795129 7.58622L1.60946 6.18285C2.3144 5.00544 3.82151 4.58919 5.03693 5.27898C6.09434 5.84984 7.46776 5.46927 8.08762 4.45836C8.28208 4.12536 8.39147 3.76857 8.36716 3.41178C8.34285 2.94795 8.47655 2.50791 8.70748 2.15112C9.15718 1.41375 9.97151 0.938032 10.8588 0.914246H12.5725ZM11.7339 9.45343C9.82566 9.45343 8.28208 10.9519 8.28208 12.8191C8.28208 14.6863 9.82566 16.173 11.7339 16.173C13.6421 16.173 15.1492 14.6863 15.1492 12.8191C15.1492 10.9519 13.6421 9.45343 11.7339 9.45343Z"
                      fill="#8F8F8F"
                    />
                  </svg>
                </Link>
              </li>
              <div className="hoveredarea" style={{ transform: `translateY(calc(120px * ${context.nav} - 39px))` }} id="hoverarea"></div>
            </ul>
          </nav>
    {/*<Link href="/home" className=" bg-[#1B1D23]  flex place-content-center items-center ">
      <svg
        className=" z-50"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="23"
        viewBox="0 0 22 23"
        fill="none"
      >
        <path
          d="M7.49621 21.2108V17.7561C7.49621 16.8742 8.21636 16.1592 9.1047 16.1592H12.352C12.7786 16.1592 13.1878 16.3275 13.4894 16.6269C13.7911 16.9264 13.9605 17.3326 13.9605 17.7561V21.2108C13.9579 21.5774 14.1027 21.93 14.3629 22.1902C14.6231 22.4504 14.9772 22.5967 15.3465 22.5967H17.562C18.5967 22.5994 19.5899 22.1932 20.3225 21.4678C21.0551 20.7424 21.4669 19.7574 21.4669 18.7302V8.88825C21.4669 8.0585 21.0964 7.27144 20.4552 6.73909L12.9186 0.76362C11.6075 -0.284084 9.72914 -0.250256 8.45726 0.843963L1.09256 6.73909C0.421135 7.25575 0.0198312 8.04515 0 8.88825V18.7202C0 20.8611 1.74829 22.5967 3.90491 22.5967H6.0698C6.83689 22.5967 7.4603 21.9823 7.46586 21.2208L7.49621 21.2108Z"
          fill="#D75433"
        />
      </svg>
    </Link>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        viewBox="0 0 23 23"
        fill="none"
      >
        <path
          d="M16.8694 0C20.7805 0 22.9885 2.21835 23 6.1295V16.8705C23 20.7805 20.7805 23 16.8694 23H6.1295C2.21835 23 0 20.7805 0 16.8705V6.1295C0 2.21835 2.21835 0 6.1295 0H16.8694ZM12.075 4.7495C11.7519 4.554 11.3609 4.554 11.0515 4.7495C10.7399 4.94385 10.5685 5.3015 10.6019 5.658V17.3765C10.6605 17.871 11.0734 18.239 11.5564 18.239C12.052 18.239 12.4649 17.871 12.5109 17.3765V5.658C12.5569 5.3015 12.3855 4.94385 12.075 4.7495ZM6.7045 8.5215C6.394 8.326 6.00185 8.326 5.6925 8.5215C5.38085 8.717 5.2095 9.07235 5.244 9.43V17.3765C5.28885 17.871 5.70285 18.239 6.19735 18.239C6.693 18.239 7.10585 17.871 7.15185 17.3765V9.43C7.1875 9.07235 7.01385 8.717 6.7045 8.5215ZM17.3524 12.696C17.043 12.5005 16.652 12.5005 16.33 12.696C16.0184 12.8915 15.847 13.2354 15.893 13.6045V17.3765C15.939 17.871 16.3519 18.239 16.8475 18.239C17.3305 18.239 17.7434 17.871 17.802 17.3765V13.6045C17.8354 13.2354 17.664 12.8915 17.3524 12.696Z"
          fill="#8F8F8F"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
      >
        <path
          d="M16.5458 2.08325C16.499 2.3758 16.4756 2.66834 16.4756 2.96088C16.4756 5.59376 18.6053 7.7223 21.2265 7.7223C21.519 7.7223 21.7999 7.68837 22.0924 7.64156V17.0837C22.0924 21.0517 19.7521 23.4037 15.7735 23.4037H7.12709C3.14735 23.4037 0.807007 21.0517 0.807007 17.0837V8.42557C0.807007 4.447 3.14735 2.08325 7.12709 2.08325H16.5458ZM16.781 9.19788C16.4639 9.16278 16.1491 9.3032 15.9607 9.56064L13.1301 13.2233L9.88752 10.6723C9.68859 10.5202 9.45456 10.4605 9.22053 10.4851C8.98766 10.5202 8.77703 10.6477 8.63544 10.835L5.17291 15.3413L5.10153 15.4466C4.9026 15.8199 4.99621 16.2996 5.34727 16.5583C5.51109 16.6636 5.68661 16.7338 5.88554 16.7338C6.15585 16.7455 6.41212 16.6039 6.57594 16.3827L9.51307 12.6019L12.8481 15.1072L12.9534 15.1763C13.3278 15.3752 13.7959 15.2828 14.065 14.9305L17.4468 10.567L17.4 10.5904C17.5872 10.3329 17.6223 10.0053 17.4936 9.71276C17.3661 9.42022 17.0841 9.22129 16.781 9.19788ZM21.3904 0C22.9467 0 24.2105 1.26378 24.2105 2.82011C24.2105 4.37643 22.9467 5.64022 21.3904 5.64022C19.8341 5.64022 18.5703 4.37643 18.5703 2.82011C18.5703 1.26378 19.8341 0 21.3904 0Z"
          fill="#8F8F8F"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="24"
        viewBox="0 0 20 24"
        fill="none"
      >
        <path
          d="M9.78264 15.416C14.8596 15.416 19.1441 16.241 19.1441 19.4239C19.1441 22.608 14.8315 23.4037 9.78264 23.4037C4.7068 23.4037 0.421143 22.5788 0.421143 19.3958C0.421143 16.2117 4.73373 15.416 9.78264 15.416ZM9.78264 0C13.2219 0 15.9776 2.75465 15.9776 6.19152C15.9776 9.6284 13.2219 12.3842 9.78264 12.3842C6.34451 12.3842 3.58769 9.6284 3.58769 6.19152C3.58769 2.75465 6.34451 0 9.78264 0Z"
          fill="#8F8F8F"
        />
      </svg>
      <div className=" w-[60px] h-[1px] bg-[#8F8F8F]"/>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
      >
        <path
          d="M12.5725 0.914246C13.4719 0.914246 14.2862 1.41375 14.7359 2.15112C14.9547 2.50791 15.1006 2.94795 15.0641 3.41178C15.0398 3.76857 15.1492 4.12536 15.3436 4.45836C15.9635 5.46927 17.3369 5.84984 18.4065 5.27898C19.6098 4.58919 21.129 5.00544 21.8218 6.18285L22.6361 7.58622C23.3411 8.76363 22.9521 10.274 21.7367 10.9519C20.7036 11.5585 20.339 12.9024 20.9589 13.9252C21.1533 14.2463 21.3721 14.5198 21.7124 14.6863C22.1378 14.9123 22.466 15.2691 22.6969 15.6259C23.1466 16.3633 23.1101 17.2671 22.6726 18.064L21.8218 19.4911C21.3721 20.2523 20.5335 20.728 19.6705 20.728C19.2451 20.728 18.7711 20.6091 18.3822 20.3712C18.0662 20.169 17.7015 20.0977 17.3126 20.0977C16.1094 20.0977 15.1006 21.0848 15.0641 22.2622C15.0641 23.6299 13.9459 24.7003 12.5482 24.7003H10.8952C9.48534 24.7003 8.36716 23.6299 8.36716 22.2622C8.34285 21.0848 7.33406 20.0977 6.1308 20.0977C5.72971 20.0977 5.36509 20.169 5.06123 20.3712C4.6723 20.6091 4.18614 20.728 3.7729 20.728C2.8978 20.728 2.05916 20.2523 1.60946 19.4911L0.770821 18.064C0.321117 17.2909 0.296809 16.3633 0.746512 15.6259C0.940979 15.2691 1.3056 14.9123 1.71884 14.6863C2.05916 14.5198 2.27794 14.2463 2.48456 13.9252C3.09226 12.9024 2.72764 11.5585 1.69454 10.9519C0.491275 10.274 0.102342 8.76363 0.795129 7.58622L1.60946 6.18285C2.3144 5.00544 3.82151 4.58919 5.03693 5.27898C6.09434 5.84984 7.46776 5.46927 8.08762 4.45836C8.28208 4.12536 8.39147 3.76857 8.36716 3.41178C8.34285 2.94795 8.47655 2.50791 8.70748 2.15112C9.15718 1.41375 9.97151 0.938032 10.8588 0.914246H12.5725ZM11.7339 9.45343C9.82566 9.45343 8.28208 10.9519 8.28208 12.8191C8.28208 14.6863 9.82566 16.173 11.7339 16.173C13.6421 16.173 15.1492 14.6863 15.1492 12.8191C15.1492 10.9519 13.6421 9.45343 11.7339 9.45343Z"
          fill="#8F8F8F"
        />
      </svg>*/}
    </div>
  );
}

export default NavItems;
