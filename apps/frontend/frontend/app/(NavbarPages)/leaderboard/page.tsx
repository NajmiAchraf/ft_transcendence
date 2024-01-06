"use client"
import Link from 'next/link';
import * as IonIcons from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { useNavContext } from '../context/NavContext';
import { getCookie } from '@/app/components/errorChecks';
import { whoami } from '@/app/components/PersonalInfo';
const LeaderBoard = () => {
  const hover = useNavContext()
  useEffect(
    () => {
      hover.setNav("2")
    }
    , []);
  const [standings, setstandings] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch("http://localhost:3001/home/standings", {
          headers: {
            Authorization: `Bearer ${getCookie("AccessToken")}`
          }
        });

        if (!data.ok) {
          throw new Error("Failed to fetch data");
        }
        const standingsinfo = await data.json();
        setstandings(standingsinfo)
      } catch (error) {
        console.error("Error fetching data:", error);
        //TokenRefresher();
      }
    };

    fetchData();
  }, []);
  console.log(standings)
  /*if (!standings) {
    return (null);
  }*/
  return (
    <div className="leaderboard">
      <div className="banner">
        <div className="overlay"></div>
        <h2>⚔️ <span>Paddle Masters Showcase</span></h2>
        <img src="/goldcoin.png"></img>
      </div>
      <div className="standings">
        <h3>🏆 Standings</h3>
        <div className="players">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>W</th>
                <th>L</th>
                <th>Score</th>
                <th>Last 5</th>
              </tr>
            </thead>
            <tbody>
              {standings ? (
                standings.map((player: any, i: number) => (
                  <tr key={i}>
                    <td>
                      <div className="playername">
                        {i === 0 ? <img src="/goldbadge.png" alt="Gold Badge" /> :
                          i === 1 ? <img src="/silverbadge.png" alt="Silver Badge" /> :
                            i === 2 ? <img src="/bronzebadge.png" alt="Bronze Badge" /> : null}
                        <span>{i + 1}</span> <span><Link href={`/profile/${player.id}`}>{player.nickname}</Link></span>
                      </div>
                    </td>
                    <td>{player.winCount}</td>
                    <td>{player.lossCount}</td>
                    <td>{player.totalPoints}</td>
                    <td>
                      <div className="matches">
                        {player.last_five_matches.map((result: any, index: number) => (
                          <IonIcon
                            key={index}
                            icon={result === 'W' ? IonIcons.checkmarkCircle : IonIcons.closeCircle}
                            data-t={(result !== "W" ? "1" : "0")}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

export default LeaderBoard;