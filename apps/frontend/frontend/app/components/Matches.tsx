import Match from "./Match";
import React from "react";
import { useState, useEffect } from 'react';
import { getCookie } from "./errorChecks";
import { useNavContext } from "../(NavbarPages)/context/NavContext";
const Matches = ({ userId }: { userId: number }) => {
    const [matches, setmatches] = useState<any>(null);

    useEffect(() => {
        console.log("kan fetch bhada :", userId)
        const fetchData = async () => {
            try {
                const data = await fetch("http://localhost:3001/user/match_history", {
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

                const matchesinfo = await data.json();
                setmatches(matchesinfo)
            } catch (error) {
                console.error("Error fetching data:", error);
                //TokenRefresher();
            }
        };

        fetchData();
    }, [userId, useNavContext().isUpdated]);
    console.log(matches)
    if (!matches) {
        return (null);
    }
    return (
        <div className="pf-section recent-matches">
            <div className="overlay"></div>
            <h4><span>recent</span> matches</h4>
            <div className="matches-class">
                <div className="matches">
                    {
                        matches.map((match: any, id: number) => (
                            <Match key={id} id={match.opponent_id} name={match.nickname} image={match.avatar} time={match.duration} myscore={match.goals.playerGoals} enemyscore={match.goals.opponentGoals} />
                        ))
                    }
                    {/*
                    <Match name="Papaya" image="/img2.png" time="20min" myscore={5} enemyscore={10} />
                    <Match name="Papaya" image="/img3.png" time="20min" myscore={5} enemyscore={10} />
                    <Match name="Papaya" image="/img4.png" time="20min" myscore={5} enemyscore={10} />
                    <Match name="Papaya" image="/img1.png" time="20min" myscore={5} enemyscore={10} />
                    <Match name="Papaya" image="/img2.png" time="20min" myscore={5} enemyscore={10} />
                    <Match name="Papaya" image="/img3.png" time="20min" myscore={5} enemyscore={10} />
                    <Match name="Papaya" image="/img4.png" time="20min" myscore={5} enemyscore={10} />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />
                    <Match score="1 - 3" name="Man Mark" time="21:37" />*/}
                </div>
            </div>
        </div>
    );
};

export default Matches;