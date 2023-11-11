import Match from "./Match";
import React from "react";
const Matches = () =>{
    return (
        <div className="pf-section recent-matches">
        <h4><span>recent</span> matches</h4>
        <div className="matches-class">
            <div className="matches">
                <Match name="Papaya" image="/img1.png" time="20min" myscore={5} enemyscore={10}/>
                <Match name="Papaya" image="/img2.png" time="20min" myscore={5} enemyscore={10}/>
                <Match name="Papaya" image="/img3.png" time="20min" myscore={5} enemyscore={10}/>
                <Match name="Papaya" image="/img4.png" time="20min" myscore={5} enemyscore={10}/>
                {/*<Match score="1 - 3" name="Man Mark" time="21:37" />
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