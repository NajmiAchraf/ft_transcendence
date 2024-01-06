import { useState, useEffect } from 'react';
import { getCookie } from './errorChecks';
import Channel from './Channel';
import { useWebSocketContext } from '../context/WebSocketContext';

const Channels = ({ userId }: { userId: number }) => {
  const [channels, setchannels] = useState<any>(null);
  const wsProvider = useWebSocketContext()
  useEffect(() => {
    const UpdateData = async () => {
      console.log("because of me ?")
      await fetchData()
    }
    wsProvider.chat.on("joined", UpdateData)
    wsProvider.chat.on("leaveChannelSelf", UpdateData)
    return () => {
      wsProvider.chat.off("joined", UpdateData)
      wsProvider.chat.off("leaveChannelSelf", UpdateData)
    }
  }, [])
  const fetchData = async () => {
    try {
      const data = await fetch("http://localhost:3001/user/channels", {
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

      const channelsinfo = await data.json();
      setchannels(channelsinfo)
    } catch (error) {
      console.error("Error fetching data:", error);
      //TokenRefresher();
    }
  };

  useEffect(() => {

    fetchData();
  }, [userId]);
  if (!channels) {
    return (null);
  }

  return (
    <div className="channels" >
      {
        channels.map((channel: any, id: number) => (
          <Channel
            key={id}
            id={channel.id}  // Make sure to include a unique key for each element in the array
            image={channel.avatar}
            name={channel.name}
            members={channel.members_count}
            isJoined={channel.isJoined}
            privacy={channel.privacy}
          />
        ))
      }
    </div >
  );
}
export default Channels;