
import Friend from './Friend';
const FriendList= () => {
    const myimg3 = "/img2.png";
        return(
        <div className="friend-list">
        <Friend image={myimg3} name="Papaya" isMe={true}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
        <Friend image={myimg3} name="Papaya" isMe={false}/>
    </div>
    );
}

export default FriendList;