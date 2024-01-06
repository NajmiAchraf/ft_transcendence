'use client';
import React from 'react';


function Avatar({img, status}:{img : string, status : string}) {

  return (
    <div className="relative">
      <div className="
        relative 
        inline-block 
        rounded-full 
        overflow-hidden
        h-9 
        w-9 
        md:h-11 
        md:w-11
      ">
        <img
          className="object-cover w-full h-full"
          src={img}
          alt="Avatar"
        />
      </div>
        <span 
          className={`absolute   block   rounded-full  ${status === "online" ? "bg-green-500 ring-2   ring-white" :( status === "offline" ? "ring-2 ring-gray-400" : (status === "in_game" ? "bg-red-500 ring-2 ring-gray-400" : "hidden"))}   top-0   right-0  h-2   w-2 md:h-3 md:w-3`}
        />
    </div>
  );
}

export default Avatar;
