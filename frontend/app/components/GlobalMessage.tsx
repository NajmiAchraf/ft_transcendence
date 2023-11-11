type globalmessageprops = {
    image: string,
    name: string,
    text: string,
    time: string
}
const GlobalMessage = (props : globalmessageprops) =>{
    return (
        <div className="message">
        <div className="avatar"><img src={props.image}/><div className="status"></div></div>
        <div className="text">
          <h4>{props.name}</h4>
          <h5>{props.text}</h5>
        </div>
        <div className="time">{props.time}</div>
      </div>
    );
};
export default GlobalMessage;