import FriendList from './FriendList';
import Channels from './Channels';
import Achievements from './Achievements';
type extrainfoprops = {
    changeInfoSec : (e : React.MouseEvent<HTMLElement>) => void,
    infoSec: string
};
const ExtraInfo = (props : extrainfoprops) =>{
    return (
        <div className="pf-section extra-info">
        <nav>
          <div className="item" data-index="0"><h4 onClick={props.changeInfoSec}>Achievements</h4></div>
          <div className="item" data-index="1"><h4 onClick={props.changeInfoSec}>Friend List</h4></div>
          <div className="item" data-index="2"><h4 onClick={props.changeInfoSec}>Channels</h4></div>
          <div className="indicator"><div className="bar" style={{left : `calc(33.3% * ${props.infoSec})`}}></div></div>
          </nav>
          <div className="ei-content">
            { props.infoSec === "1" ? <FriendList /> :
            (props.infoSec === "2" ? <Channels /> : <Achievements/>)}
          </div>
      </div>
    );
}

export default ExtraInfo;