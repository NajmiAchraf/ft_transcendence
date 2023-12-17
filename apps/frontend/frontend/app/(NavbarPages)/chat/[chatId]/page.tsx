"use client"
import { formatChatDate, formatTimeDifference, getCookie } from '@/app/components/errorChecks';
import { whoami } from '@/app/components/PersonalInfo';
import { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as IonIcons from 'ionicons/icons';
import { useWebSocketContext } from '@/app/context/WebSocketContext';
import { useNavContext } from '@/app/(NavbarPages)/context/NavContext';
import { useRouter } from 'next/navigation';
type messageType = {
    sender_id: string,
    nickname: string,
    message_text: string,
    avatar: string,
    status: string,
    created_at: string,
};

type channelType = {
    channel_id: string;
    channel_name: string;
    avatar: string;
    last_message: string;
    sender_id: number;
    nickname: string;
    created_at: string;
};

type dmType = {
    profileId: string;
    nickname: string;
    avatar: string;
    status: string;
    message_text: string;
    created_at: string;
    isSender: boolean;
};
type memberType = {
    id: string;
    nickname: string;
    avatar: string;
    status: string;
    operate: boolean;
    isSelf: boolean;
    isChannelProtected: boolean;
};

type channelMembersType = {
    owner: memberType;
    admins: memberType[];
    members: memberType[];
};
type FriendType = {
    id: string;
    nickname: string;
    avatar: string;
    status: string;
};

const Chat = () => {
    const router = useRouter();
    const urlParams = useParams()
    const wsProvider = useWebSocketContext()
    const [inputValue, setInputValue] = useState('');
    /*console.log(urlParams.chatId, " : ", typeof urlParams.chatId)*/
    const [channels, setChannels] = useState<channelType[]>([]);
    const [dms, setDms] = useState<dmType[]>([]);
    const [channelMembers, setChannelMembers] = useState<channelMembersType | null>(null);
    const [dmMembers, setDmMembers] = useState<memberType[] | null>(null);;
    const [messages, setMessages] = useState<messageType[]>([]);
    const [friends, setFriends] = useState<FriendType[]>([]);
    const [isDivVisible, setDivVisible] = useState(false);
    const [isCreateChannel, setIsCreateChannel] = useState(false)
    const [privacy, setprivacy] = useState("")
    const [password, setPassword] = useState("")
    const [passUpdateState, setPassUpdateState] = useState("");

    const context = useNavContext()
    useEffect(() => {
        wsProvider.chat.on("receiveChannelMessage", async (event) => {
            await fetchChannels()
            if ((urlParams.chatId as string).endsWith("_channel"))
                setMessages((prevMessages) => [event, ...prevMessages]);
        })

        wsProvider.chat.on("receiveDM", async (event) => {
            await fetchDMS()
            if (!(urlParams.chatId as string).endsWith("_channel"))
                setMessages((prevMessages) => [event, ...prevMessages]);
        })

    }, [])
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const fetchChannels = async () => {
        try {
            const data = await fetch("http://localhost:3001/chatHttp/channels", {
                headers: {
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                }
            })
            if (!data.ok)
                throw new Error("Something went wrong")
            const res = await data.json()
            setChannels(res)
            console.log(channels)
        }
        catch (e) {
            console.log(e)
        }
    }
    const fetchDMS = async () => {
        try {
            const data = await fetch("http://localhost:3001/chatHttp/dms", {
                headers: {
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                }
            })
            if (!data.ok)
                throw new Error("Something went wrong")
            const res = await data.json()
            setDms(res)
            console.log(channels)
        }
        catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        fetchDMS()
        fetchChannels()
    }, [])

    useEffect(() => {
        const fetchMessages = async () => {
            setMessages([])
            if (Number(urlParams.chatId as string) != await whoami()) {
                try {
                    const suffix: string = "_channel"
                    let chatId: string = urlParams.chatId as string
                    let url: string = "dm_history"
                    if (chatId.endsWith(suffix)) {
                        chatId = chatId.slice(0, -suffix.length)
                        url = "channel_message_history"
                    }
                    const data = await fetch(`http://localhost:3001/chatHttp/${url}`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${getCookie("AccessToken")}`
                        },
                        body: JSON.stringify((url === "dm_history" ? { profileId: Number(chatId) } : { channelId: Number(chatId) }))
                    });

                    if (!data.ok) {
                        throw new Error("Failed to fetch data");
                    }
                    const res = await data.json()
                    console.log(res)
                    setMessages(res)
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
        }
        fetchMessages()
    }, [])

    const getMembers = async () => {
        try {
            const suffix: string = "_channel"
            let chatId: string = urlParams.chatId as string
            let url: string = "getDmFriend"
            if (chatId.endsWith(suffix)) {
                chatId = chatId.slice(0, -suffix.length)
                url = "channel_members"
            }
            const data = await fetch(`http://localhost:3001/chatHttp/${url}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                },
                body: JSON.stringify((url === "getDmFriend" ? { profileId: Number(chatId) } : { channelId: Number(chatId) }))
            });

            if (!data.ok) {
                throw new Error("Failed to fetch data");
            }

            if (url === "getDmFriend") {
                const res = await data.json();
                setDmMembers(res)
            }
            else {
                const res: channelMembersType = await data.json();
                console.log("hehe")
                setChannelMembers(res)
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            //TokenRefresher();
        }
    }

    useEffect(() => {
        getMembers()
    }, [])

    const InviteToChannel = async (_profileId: string) => {
        const _channelId: string = (urlParams.chatId as string).slice(0, -("_channel").length);
        wsProvider.chat.emit("addChannelMember", { profileId: Number(_profileId), channelId: Number(_channelId) })
        setTimeout(() => { getMembers(); getFriends() }, 100)
    }

    const kickChannelMember = async (_profileId: string) => {
        const _channelId: string = (urlParams.chatId as string).slice(0, -("_channel").length);
        wsProvider.chat.emit("kickChannelMember", { profileId: Number(_profileId), channelId: Number(_channelId) })
        setTimeout(() => { getMembers() }, 100)
    }
    const addChannelAdmin = async (_profileId: string) => {
        const _channelId: string = (urlParams.chatId as string).slice(0, -("_channel").length);
        wsProvider.chat.emit("addChannelAdmin", { profileId: Number(_profileId), channelId: Number(_channelId) })
        setTimeout(() => { getMembers() }, 100)
    }
    const muteChannelMember = async (_profileId: string) => {
        console.log("hana dkhelt")
        const _channelId: string = (urlParams.chatId as string).slice(0, -("_channel").length);
        console.log(_profileId, _channelId)
        wsProvider.chat.emit("muteChannelMember", { profileId: Number(_profileId), channelId: Number(_channelId) })
        console.log(_profileId, _channelId)
    }
    const banChannelMember = async (_profileId: string) => {
        const _channelId: string = (urlParams.chatId as string).slice(0, -("_channel").length);
        wsProvider.chat.emit("banChannelMember", { profileId: Number(_profileId), channelId: Number(_channelId) })
        setTimeout(() => { getMembers(); }, 100)
    }
    useEffect(() => {
        const handleKickChannelMember = async (event: any) => {
            if (event.message === "you have been kicked") {
                router.push(`/profile/${context.id}`);
            }
        };

        wsProvider.chat.on("kickChannelMember", handleKickChannelMember);

        const handleBanChannelMember = async (event: any) => {
            if (event.message === "you have been banned") {
                router.push(`/profile/${context.id}`);
            }
        };

        wsProvider.chat.on("banChannelMember", handleBanChannelMember);

        const handleAddChannelAdmin = async (event: any) => {
            getMembers();
        };

        wsProvider.chat.on("addChannelAdmin", handleAddChannelAdmin);


        const handleAddChannelMember = async (event: any) => {
            if (Number(event.id) == context.id) {
                await fetchChannels()
            }
        };

        wsProvider.chat.on("addChannelMember", handleAddChannelMember);

        const handleMuteChannelMember = async (event: any) => {
            if ((urlParams.chatId as string).endsWith) {
                const Id: string = (urlParams.chatId as string).slice(0, -("_channel").length);
                if (event.channelId === Id) {
                    const el = document.querySelector(".sendbox button")
                    if (el)
                        el.classList.add("non-active-btn")
                }
            }
        };
        wsProvider.chat.on("muteChannelMember", handleMuteChannelMember);


        const handleLeaveChannelSelf = async (event: any) => {
            router.push(`/chat/${context.id}`)
        };
        wsProvider.chat.on("leaveChannelSelf", handleLeaveChannelSelf);


        const handleLeaveChannelOthers = async (event: any) => {
            await getMembers()
        };
        wsProvider.chat.on("leaveChannelOthers", handleLeaveChannelOthers);
        const handleJoinedEvent = async () => {
            await fetchChannels()
        }
        const UpdateData = () => {
            fetchChannels()
        }
        wsProvider.chat.on("joined", UpdateData)
        wsProvider.chat.on("leaveChannelSelf", UpdateData)
        wsProvider.chat.on("joined", handleJoinedEvent)
        return () => {
            wsProvider.chat.off("joined", UpdateData);
            wsProvider.chat.off("leaveChannelSelf", UpdateData);
            wsProvider.chat.off("joined", handleJoinedEvent)
            wsProvider.chat.off("leaveChannelOthers", handleLeaveChannelOthers);
            wsProvider.chat.off("leaveChannelSelf", handleLeaveChannelSelf);
            wsProvider.chat.off("addChannelAdmin", handleAddChannelAdmin);
            wsProvider.chat.off("muteChannelMember", handleMuteChannelMember);
            wsProvider.chat.off("addChannelMember", handleAddChannelMember);
            wsProvider.chat.off("banChannelMember", handleBanChannelMember);
            wsProvider.chat.off("kickChannelMember", handleKickChannelMember);
        };
    }, [router, context.id]);

    const getFriends = async () => {
        try {
            const Id = (urlParams.chatId as string).slice(0, -("_channel").length);
            const data = await fetch('http://localhost:3001/chatHttp/inviteToChannelList', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                },
                body: JSON.stringify({ channelId: Number(Id) })
            });

            if (!data.ok) {
                throw new Error("Failed to fetch data");
            }
            const res = await data.json()
            if (res)
                setDivVisible(true)
            setFriends(res)
        } catch (error) {
            console.error("Error fetching data:", error);
            //TokenRefresher();
        }
    }
    useEffect(() => {
        const el: HTMLElement | null = document.querySelector(".chat .messages .results")
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages.length])
    const submitMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputValue.trim() !== '') {
            const chatId = urlParams.chatId as string;
            let Id: Number = ((chatId).endsWith("_channel") ? Number(chatId.slice(0, -("_channel").length)) : Number(chatId))
            if ((urlParams.chatId as string).endsWith("_channel"))
                wsProvider.chat.emit("channelCreateChat", { channelId: Id, message: inputValue })
            else {
                wsProvider.chat.emit("directCreateChat", { profileId: Id, message: inputValue })
            }
            setInputValue("")
        }
    }
    const createChannel = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(document.getElementById('addChannelFrom') as HTMLFormElement);
        try {
            const data = await fetch("http://localhost:3001/chatHttp/createChannel",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: formData
                })
            if (!data.ok) {
                throw new Error("something went wrong")
            }
            console.log("I re-fetched")
            fetchChannels()
        }
        catch (e) {
        }
    }
    const leaveChannel = async () => {
        const Id: string = (urlParams.chatId as string).slice(0, -("_channel").length);
        wsProvider.chat.emit("leaveChannel", { channelId: Number(Id) })
    }
    const deleteChannel = async () => {
        try {
            const data = await fetch('http://localhost:3001/chatHttp/deleteChannel',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: JSON.stringify({ channelId: Number((urlParams.chatId as string).slice(0, -("_channel").length)) })
                })
            if (!data.ok) {
                throw new Error("something went wrong")
            }
            router.push(`/chat/${context.id}`)
        }
        catch (e) {
        }
    }
    const UpdatePassword = async () => {
        if (password.length <= 1 || passUpdateState.length <= 1)
            return;
        try {
            const data = await fetch(`http://localhost:3001/chatHttp/${passUpdateState}`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: JSON.stringify({ channelId: Number((urlParams.chatId as string).slice(0, -("_channel").length)), password })
                })
            if (!data.ok) {
                throw new Error("something went wrong")
            }
            await getMembers();
            setPassUpdateState("");
        }
        catch (e) {
        }
    }
    const removePassword = async () => {
        try {
            const data = await fetch('http://localhost:3001/chatHttp/removeChannelPassword',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: JSON.stringify({ channelId: Number((urlParams.chatId as string).slice(0, -("_channel").length)) })
                })
            if (!data.ok) {
                throw new Error("something went wrong")
            }
            await getMembers();
            setPassUpdateState("");
        }
        catch (e) {
        }
    }
    return (
        <div className="chat">
            <div className="sec-1">
                <div className="dms">
                    <h1>channels <IonIcon onClick={async () => { setIsCreateChannel(true) }} icon={IonIcons.addSharp}></IonIcon></h1>
                    {isCreateChannel && <div className="add-channel">
                        <form onSubmit={createChannel} id="addChannelFrom">
                            <IonIcon onClick={() => setIsCreateChannel(false)} icon={IonIcons.closeCircle}></IonIcon>
                            <input name="channelName" placeholder="channel name" required />
                            <select name="privacy" onChange={(e) => setprivacy(e.target.value)} required>
                                <option value="public">public</option>
                                <option value="protected">protected</option>
                                <option value="private">private</option>
                            </select>
                            {(privacy === "protected" ?
                                <input type="password" name="password" placeholder="Enter password" required />
                                : ""
                            )}
                            <input name="avatar" id="upload-photo" type="file" accept="image/*" required />
                            <button type="submit">Add Channel</button>
                        </form>
                    </div>}
                    <div className="channels">
                        {channels.map((channel, id) => (
                            <Link href={`/chat/${channel.channel_id}_channel`} key={id}>
                                <div className="dm-section">
                                    <div className='dm-img'>
                                        <img src={channel.avatar}></img>
                                    </div>
                                    <div className="dm-info">
                                        <h3>{channel.channel_name}</h3>
                                        {(channel.last_message ?
                                            <>
                                                <h4>{(context.id == channel.sender_id ? "You" : channel.nickname)} : {channel.last_message}</h4>
                                                <h5>{formatChatDate(new Date(channel.created_at))}</h5>
                                            </>
                                            : <h4>no messages were found</h4>)}
                                    </div>
                                </div>
                            </Link>
                        ))}

                    </div>
                    <h1>direct</h1>
                    <div className="single-dm">
                        {dms.map((dm, id) => (
                            <Link href={`/chat/${dm.profileId}`} key={id}>
                                <div className="dm-section">
                                    <div className='dm-img'>
                                        <img src={dm.avatar}></img>
                                    </div>
                                    <div className="dm-info">
                                        <h3><div className={`status ${dm.status}`}></div>{dm.nickname}</h3>
                                        <h4>{(dm.isSender ? "You : " : "")}{dm.message_text}</h4>
                                        <h5>{formatChatDate(new Date(dm.created_at))}</h5>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                {(context.id != Number(urlParams.chatId as string) ?
                    <div className="settings">
                        {(isDivVisible &&
                            <div className="add-friends">
                                <div id="friends" className="friend-list">
                                    <IonIcon id="close-btn" onClick={() => setDivVisible(false)} icon={IonIcons.closeCircle}></IonIcon>
                                    {friends.length ? friends.map((friend, id) => (
                                        <div key={id} className="friend">
                                            <div className="friend-image">
                                                <div className={`status ${friend.status}`}></div>
                                                <img src={friend.avatar} />
                                            </div>
                                            <h4>{friend.nickname}</h4>
                                            <IonIcon onClick={() => { InviteToChannel(friend.id) }} icon={IonIcons.addSharp}></IonIcon>
                                        </div>
                                    )) : <div>you have no available friends at the moment</div>}
                                </div>
                            </div>
                        )}
                        <h1>Settings {((urlParams.chatId as string).endsWith("_channel") ? <IonIcon onClick={async () => { await getFriends() }} icon={IonIcons.addSharp}></IonIcon> : "")}</h1>
                        {((urlParams.chatId as string).endsWith("_channel") && channelMembers ?
                            <>
                                <h2>Owner</h2>
                                <div className="user">
                                    <div className="user-img">
                                        <img src={channelMembers?.owner.avatar}></img>
                                    </div>
                                    <div className="user-info">
                                        {((passUpdateState === "changeChannelPassword" || passUpdateState === "addChannelPassword") && channelMembers?.owner.id === String(context.id) ?
                                            <div className="edit-password">
                                                <div className="section">
                                                    <IonIcon onClick={() => { setPassUpdateState(""); setPassword("") }} icon={IonIcons.closeCircle}></IonIcon>
                                                    <h3>Update your channel privacy</h3>
                                                    <input name="password" type="password" placeholder="Enter your new password" onChange={(e) => setPassword(e.target.value)} />
                                                    <button onClick={UpdatePassword}>Change</button>
                                                </div>
                                            </div>
                                            : ""
                                        )}
                                        <h4><Link href={`/profile/${channelMembers?.owner.id}`}>{channelMembers?.owner.nickname}</Link></h4>
                                        {(Number(channelMembers?.owner.id) == context.id ?
                                            <div className="options">
                                                <IonIcon onClick={deleteChannel} icon={IonIcons.trashOutline}></IonIcon>
                                                {(channelMembers?.owner.isChannelProtected ? <>
                                                    <IonIcon onClick={removePassword} icon={IonIcons.removeCircle}></IonIcon>
                                                    <IonIcon onClick={() => setPassUpdateState("changeChannelPassword")} icon={IonIcons.settings}></IonIcon>
                                                </> : <IonIcon onClick={() => setPassUpdateState("addChannelPassword")} icon={IonIcons.addCircle}></IonIcon>)}
                                            </div>
                                            : "")}
                                    </div>
                                </div>
                                <h2>Admins</h2>
                                {channelMembers?.admins.map((admin, id) => (
                                    <div key={id} className="user">
                                        <div className="user-img">
                                            <img src={admin.avatar}></img>
                                        </div>
                                        <div className="user-info">
                                            <h4><Link href={`/profile/${admin.id}`}>{admin.nickname}</Link></h4>
                                            {(admin.operate ?
                                                <div className="options">
                                                    <IonIcon onClick={() => banChannelMember(admin.id)} icon={IonIcons.removeCircle} />
                                                    <IonIcon onClick={() => kickChannelMember(admin.id)} icon={IonIcons.closeCircle} />
                                                    <IonIcon onClick={() => muteChannelMember(admin.id)} icon={IonIcons.volumeMute} />
                                                </div> : "")}
                                        </div>
                                    </div>
                                ))}
                                <h2>Members</h2>
                                {channelMembers?.members.map((member, id) => (
                                    <div key={id} className="user">
                                        <div className="user-img">
                                            <img src={member.avatar}></img>
                                        </div>
                                        <div className="user-info">
                                            <h4><Link href={`/profile/${member.id}`}>{member.nickname}</Link></h4>
                                            {(member.operate ?
                                                <div className="options">
                                                    <IonIcon onClick={() => banChannelMember(member.id)} icon={IonIcons.removeCircle} />
                                                    <IonIcon onClick={() => kickChannelMember(member.id)} icon={IonIcons.closeCircle} />
                                                    <IonIcon onClick={() => muteChannelMember(member.id)} icon={IonIcons.volumeMute} />
                                                    <IonIcon onClick={() => addChannelAdmin(member.id)} icon={IonIcons.personCircle} />
                                                </div> : "")}
                                        </div>
                                    </div>
                                ))}
                            </>
                            :
                            <>
                                <h2>Members</h2>
                                {dmMembers && dmMembers.map((member, id) => (
                                    <div key={id} className="user">
                                        <div className="user-img">
                                            <img src={member.avatar}></img>
                                        </div>
                                        <div className="user-info">
                                            <h4><Link href={`/profile/${member.id}`}>{member.nickname}</Link></h4>
                                        </div>
                                    </div>
                                ))}
                            </>)}
                    </div>
                    : "")}
            </div>
            <div className="messages">
                {((urlParams.chatId as string).endsWith("_channel") ? 
                    <IonIcon onClick={leaveChannel} icon={IonIcons.logOut}></IonIcon>
                    :<IonIcon onClick={() =>{
                        wsProvider.chat.emit("invitePlayer", {senderId: context.id, receiverid : (urlParams.chatId as string)})
                    }}icon={IonIcons.addCircle}></IonIcon>
                )}
                <div className="results">
                    {messages.slice().reverse().map((message, id) => (
                        <div key={id} className={(Number(message.sender_id) == context.id ? "message mine" : "message")}>
                            <div className="image">
                                <img src={message.avatar}></img>
                                <div className={`status ${message.status}`}></div>
                            </div>
                            <div className="message-content">
                                <h3>{message.nickname}</h3>
                                <h5>{message.message_text}</h5>
                                <h6>{formatChatDate(new Date(message.created_at))}</h6>
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={submitMessage} className="sendbox">
                    <input type="text" placeholder="Send a message " value={inputValue} onChange={handleInputChange} />
                    <button type="submit"><IonIcon icon={IonIcons.send}></IonIcon></button>
                </form>
            </div>
        </div >);
}
export default Chat;