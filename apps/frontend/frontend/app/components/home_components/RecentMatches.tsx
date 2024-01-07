"use client"
import { getValidDate } from "@/app/components/errorChecks";
import React from "react";
type PlayerType = {
  id: number;
  nickname: string;
  avatar: string;
  points: string;
}
type MatchType = {
  winner: PlayerType;
  loser: PlayerType;
  startedAt: string;
}
function RecentMatches({
  winner,
  loser,
  startedAt
}: MatchType) {
  return (
    <div className="grid grid-cols-3 gap-[12px] bg-[#272932] rounded-[20px] px-[13px] py-[16px] ">
      <div className="flex space-x-3 bg-black/[0.3] rounded-[20px] items-center place-content-center py-[8px] px-[14px]">
        <img className="w-[43px] z-30 h-[43px] rounded-xl " src={winner.avatar} />
        <p className="w-[59.83px] z-30 text-white text-xs font-medium font-Montserrat leading-none truncate">
          {winner.nickname}
        </p>
      </div>
      <div className="flex flex-col items-center place-content-center ">
        <div className=" flex items-center place-content-center space-x-[10px]">
          <p className=" opacity-90 bg-black/[0.3] rounded-sm px-[10px] py-[5px] text-white font-Inter font-bold text-xs">
            {winner.points}
          </p>
          <div className="flex flex-col space-y-[4px] justify-center items-center">
            <div className=" opacity-95 bg-red-50 rounded-[1px] py-[2.5px] px-[2.5px]" />
            <div className=" opacity-95 bg-red-50 rounded-[1px] py-[2.5px] px-[2.5px]" />
          </div>
          <p className="opacity-90 bg-black/[0.3] rounded-sm px-[10px] py-[5px] text-white font-Inter font-bold text-xs">
            {loser.points}
          </p>
        </div>
        <p className="text-white font-inter text-xs font-normal ">
          Date
        </p>
        <p className="text-white font-inter text-xs font-normal  rounded-[20px] px-5 py-1 opacity-85 bg-[#1B1D23]">
          {getValidDate(startedAt)}
        </p>
      </div>

      <div className="flex space-x-3 bg-black/[0.3] rounded-[20px] items-center place-content-center py-[8px] px-[14px]">
        <img className="w-[43px] z-30 h-[43px] rounded-xl " title={loser.nickname} src={loser.avatar} />
        <p className="w-[59.83px] z-30 text-white text-xs font-medium font-Montserrat leading-none truncate">
          {loser.nickname}
        </p>
      </div>
    </div>
  );
}

export default RecentMatches;
