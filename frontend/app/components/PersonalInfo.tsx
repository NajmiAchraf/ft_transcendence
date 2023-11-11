import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

const PersonalInfo = () =>{
    return (
        <div className="pf-section pf">
        <div className="background">
        </div>
        <div className="p-info">
            <div className="sec-1">
              <div className="p-info-sec">
                <h6>Total Game</h6>
                <h4>200</h4>
              </div>
              <div className="p-info-sec">
                <h6>Win</h6>
                <h4>85%</h4>
              </div>
              <div className="p-info-sec">
                <h6>Loss</h6>
                <h4>26%</h4>
              </div>
            </div>
            <div className="player-image">
              <img src={"/profile.png"}/>
              <h4>@Magnet_t</h4>
              <h6>@evans99</h6>
            </div>
            <div className="sec-2">
              <div className="p-info-sec">
                <h6>Points Scored</h6>
                <h4>70</h4>
              </div>
              <div className="p-info-sec">
                <h6>Highest Score</h6>
                <h4>8</h4>
              </div>
            </div>
          </div>
        <div className="buttonpart">
          <button className="addbtn"><IonIcon icon={IonIcons.add} /> add</button>
        </div>
        <div className="levelpart">
          <div className="level"><h5>Level 4</h5> <div className="bar"><div className="bar-fill">80%</div></div></div>
        </div>
      </div>
    );
}
export default PersonalInfo;