"use client"
import { formatGameTime } from "./errorChecks";
type matchprops = {
    id : number,
    name : string,
    image : string,
    myscore : number,
    enemyscore : number,
    time : number,
};
const Match = (props : matchprops) => {
    return (
        <div className="match">
            <div className="avatar"><img src={(props.id > 0 ? props.image : "/img1.png")}/></div>
            <h3>{props.name.slice(0, 8)}</h3>
            <div className="time">{formatGameTime(props.time)}</div>
            <div className="score"><span className={(props.enemyscore > props.myscore ? "loss" : "win")}>{props.myscore}</span> - {props.enemyscore}</div>
        </div>
    );
};

export default Match;