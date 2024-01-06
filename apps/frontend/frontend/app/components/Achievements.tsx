"use client"
import Achievement from "./Achievement";
import { useState, useEffect } from "react";
import { getCookie } from "./errorChecks";
import { useNavContext } from "../(NavbarPages)/context/NavContext";
import { useParams } from "next/navigation";
type AchievementType = {
  image: string;
  title: string;
  desc: string;
  on: boolean;
};

const Achievements = ({ userId }: { userId: number }) => {
  const [dbachievements, setDBachievements] = useState<AchievementType[]>();
  const urlParams = useParams()
  const allAchievements: AchievementType[] = [
    { image: "/welcome.png", title: "Welcome", desc: "First Played Match", on: false },
    { image: "/cyborg.png", title: "Cyborg", desc: "1 scored point VS Bot", on: false },
    { image: "/boomer.png", title: "Boomer", desc: "First loss, it's fine", on: false },
    { image: "/streaker.png", title: "Streaker", desc: "3 wins in a row", on: false },
    { image: "/speedrun.png", title: "SpeedRun", desc: "10 matches in 30 mins", on: false },
    { image: "/normal.png", title: "PerfectTen", desc: "A Perfect 10-0 Game", on: false },
    { image: "/happy.png", title: "IamAHuman", desc: "first loss VS Bot", on: false },
    { image: "/grandmaster.png", title: "GrandMaster", desc: "30 matches in a row", on: false },
  ];
  const context = useNavContext()
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await fetch('http://localhost:3001/user/achievements', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie("AccessToken")}`
          },
          body: JSON.stringify({ profileId: Number(urlParams.userId as string)})
        });
  
        if (!data.ok) {
          throw new Error("something went wrong");
        }
  
        const res = await data.json();
  
        if (res && Array.isArray(res)) {
          const updatedAchievements = allAchievements.map((achievement) => {
            const matchingAchievement = res.find((fetchedAchievement) => fetchedAchievement === achievement.title);
            return matchingAchievement ? { ...achievement, on: true } : achievement;
          });
  
          setDBachievements(updatedAchievements);
        }
      } catch (e) {
        console.error("Error fetching achievements:", e);
      }
    };
  
    fetchAchievements();
  }, []);
  return (
    <div className="achievements">
      {dbachievements && dbachievements.map((achievement, index) => (
        <Achievement key={index} {...achievement} />
      ))}
    </div>
  );
};

export default Achievements;