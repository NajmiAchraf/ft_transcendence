"use client"
import Friend from './Friend';
import { useState, useEffect } from "react"
import { getCookie } from './errorChecks';
import { TokenRefresher } from './errorChecks';
import { useNavContext } from '../(NavbarPages)/context/NavContext';
const FriendList = ({ userId }: { userId: number }) => {
    const [friendList, setfriendList] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetch(`${process.env.API_URL}/user/friends_list`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: JSON.stringify({ profileId: userId })
                });

                if (!data.ok) {
                    throw new Error("Failed to fetch data");
                }

                const friendListinfo = await data.json();
                setfriendList(friendListinfo)
            } catch (error) {
                console.error("Error fetching data:", error);
                //TokenRefresher();
            }
        };

        fetchData();
    }, [userId, useNavContext().isUpdated]);
    console.log(friendList)
    if (!friendList) {
        return (null);
    }
    const myimg3 = "/img2.png";
    return (
        <div className="friend-list">
            {
                friendList.map((friend: any) => (
                    <Friend
                        key={friend.id}
                        id={friend.id}  // Make sure to include a unique key for each element in the array
                        image={friend.avatar}
                        name={friend.nickname}
                        status={friend.status}
                    />
                ))
            }
            {/*<Friend image={myimg3} name="Papaya" isMe={true} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
            <Friend image={myimg3} name="Papaya" isMe={false} />
    <Friend image={myimg3} name="Papaya" isMe={false} />*/}
        </div >
    );
}

export default FriendList;