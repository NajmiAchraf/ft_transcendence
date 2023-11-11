"use client"
import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

const LeaderBoard = () => {
    return (
        <div className="leaderboard">
        <div className="banner">
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