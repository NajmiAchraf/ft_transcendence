type channelprops = {
  image : string,
  name : string,
  members: string
};
const Channel = (props : channelprops) =>{
    return (
        <div className="channel">
        <div className="background">
          <img src={props.image}/>
        </div>
        <div className="content">
          <div className="details">
            <h4>{props.name}</h4>
            <h6>{props.members} member</h6>
          </div>
          <div className="buttons">
            <button>Chat</button>
            <button>Leave</button>
          </div>
        </div>
      </div>
    );
};

export default Channel;