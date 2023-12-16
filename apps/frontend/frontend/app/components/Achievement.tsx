import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
type friendprops = {
    image : string,
    title : string,
    desc : string,
    on  : boolean
};
const Achievement = (props : friendprops) => {
    return (
        <div className={`achievement ${props.on ? "on" : ""}`}>
                <div className="icon-sec">
                    <img src={props.image} />
                </div>
                <div className="content">
                    <h4>{props.title}</h4>
                    <h5>{props.desc}</h5>
                </div>
            </div>
    );
};
export default Achievement;