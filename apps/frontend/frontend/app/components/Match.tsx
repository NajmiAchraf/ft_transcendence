type matchprops = {
    name : string,
    image : string,
    myscore : number,
    enemyscore : number,
    time : string,
};
const Match = (props : matchprops) => {
    return (
        <div className="match">
            <div className="avatar"><img src={props.image}/></div>
            <h3>{props.name}</h3>
            <div className="time">{props.time}</div>
            <div className="score"><span className={(props.enemyscore > props.myscore ? "loss" : "win")}>{props.myscore}</span> - {props.enemyscore}</div>
        </div>
    );
};

export default Match;