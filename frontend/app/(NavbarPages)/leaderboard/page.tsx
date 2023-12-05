"use client"
import * as IonIcons from 'ionicons/icons';
import { useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { useNavContext } from '../context/NavContext';
const LeaderBoard = () => {
  const hover = useNavContext()
  useEffect(
    () => {
      hover.setNav("2")
      const myid: NodeJS.Timeout = setTimeout(() => { hover.setIsLoading(false); }, 500);
      return () => clearTimeout(myid);
    }
    , []);
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
              <tr>
                <td><div className="playername"> <img src={"/goldbadge.png"}></img><span>1</span> <span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>2</span> <img src={"/silverbadge.png"}></img> <span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>

              <tr>
                <td><div className="playername"><span>3</span> <img src={"/bronzebadge.png"}></img> <span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>

              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
              <tr>
                <td><div className="playername"><span>4</span><span>NoobPlayer69</span></div></td>
                <td>14</td>
                <td>13</td>
                <td>5.31</td>
                <td><div className="matches"><IonIcon icon={IonIcons.closeCircle} data-t="1" /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /> <IonIcon icon={IonIcons.checkmarkCircle} /></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;