import Link from "next/link";
type globalmessageprops = {
    id : number,
    image: string,
    name: string,
    text: string,
    time: string,
    status : string
}
const GlobalMessage = (props : globalmessageprops) =>{
    return (
        <div className="message">
        <div className="avatar"><img src={props.image}/><div className={"status " +  (props.status !== "online" ? "offline-status" : "")}></div></div>
        <div className="text">
          <Link href={`/profile/${props.id}`}>{props.name}</Link>
          <h5 title={props.text}>{props.text}</h5>
        </div>
        <div className="time">{props.time}</div>
      </div>
    );
};
export default GlobalMessage;