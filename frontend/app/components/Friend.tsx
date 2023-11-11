import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
type friendprops = {
    image : string,
    name : string,
    isMe : boolean
};
const Friend = (props : friendprops) => {
    return (
        <div className="friend">
        <div className="info">
            <img src={props.image} />
            <h4>{props.name}</h4>
        </div>
        <div className="optionbtn"><button className={props.isMe ? "myself" : ""}>{props.isMe ? <IonIcon icon={IonIcons.options}/> : "Unfriend"}</button></div>
        </div>
    );
};
export default Friend;