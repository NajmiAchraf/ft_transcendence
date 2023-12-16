import * as IonIcons from 'ionicons/icons';
import Link from 'next/link';
import { IonIcon } from '@ionic/react';
type friendprops = {
    id: number,
    image: string,
    name: string,
    status: string
};
const Friend = (props: friendprops) => {
    return (
        <div className="friend">
            <div className="info">
                <img src={props.image} />
                <h4><Link href={`/profile/${props.id}`}>{props.name}</Link></h4>
            </div>
            <div className="optionbtn">
                {(props.status === "self" ? <button className="myself"><IonIcon icon={IonIcons.options} /></button> :
                    (props.status === "friend" ? <button>Unfriend</button> : <button>Add</button>))}</div>
        </div>
    );
};
export default Friend;