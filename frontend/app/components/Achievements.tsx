import Achievement from "./Achievement";
const Achievements = () =>{
    return (
        <div className="achievements">
            <Achievement image="/welcome.png" title="Welcome" desc="First Played Match" on={true} />
            <Achievement image="/cyborg.png" title="Cyborg" desc="1 scored point VS Bot" on={false} />
            <Achievement image="/boomer.png" title="Boomer" desc="First loss, it's fine" on={false} />
            <Achievement image="/streaker.png" title="Streaker" desc="3 wins in a row" on={false} />
            <Achievement image="/speedrun.png" title="SpeedRun" desc="10 matches in 30 mins" on={false} />
            <Achievement image="/normal.png" title="Normal" desc="5 random wins" on={false} />
            <Achievement image="/happy.png" title="Normal" desc="first loss VS Bot" on={false} />
            <Achievement image="/grandmaster.png" title="GrandMaster" desc="30 matches in a row" on={false} />

        </div>
    );
};

export default Achievements;