import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import GlobalMessage from './GlobalMessage';
const GlobalChat = () =>{
    return (
        <div className="pf-section global-chat">
        <h3>Live chat</h3>
        <div className="messages">
            <GlobalMessage image={"/img1.png"} name="BigDaddy" text="Lorem ipsum?" time="2h ago"/>
            <GlobalMessage image={"/img2.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>
            <GlobalMessage image={"/img3.png"} name="BigDaddy" text="Lorem ipsum?" time="2h ago"/>
            <GlobalMessage image={"/img4.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>
            <GlobalMessage image={"/img2.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>
            <GlobalMessage image={"/img1.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>
            <GlobalMessage image={"/img4.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>
            <GlobalMessage image={"/img3.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>
            <GlobalMessage image={"/img4.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>
            <GlobalMessage image={"/img1.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>
            <GlobalMessage image={"/img1.png"} name="BigDaddy" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." time="2h ago"/>

        </div>
        <div className="text-input">
          <input type="text" placeholder="send message"/>
          <div className="btn"><button><IonIcon icon={IonIcons.send} /></button></div>
        </div>
      </div>
    );
}
export default GlobalChat;