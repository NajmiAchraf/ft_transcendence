import Channel from './Channel';
const Channels = () =>{
    return (
        <div className="channels">
        <Channel image={"/robot1.jpeg"} name="Crew" members="14" />
        <Channel image={"/robot2.jpeg"} name="Crew" members="14" />
        <Channel image={"/bubble.jpeg"} name="Crew" members="14" />
      </div>
    );
}
export default Channels;