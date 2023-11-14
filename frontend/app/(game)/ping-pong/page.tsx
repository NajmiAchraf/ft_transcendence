import React, { ComponentType } from 'react';
import dynamic from 'next/dynamic';

import PropsContextProvider from './context/PropsContext';

const StartPingPong: ComponentType<any> = dynamic(() => import('./component/StartPingPong'), { ssr: false }) as ComponentType<any>;

const Page = () => {
	return (
		<div id="root" style={{ backgroundColor: "#000000" }}>
			<PropsContextProvider>
				<StartPingPong />
			</PropsContextProvider>
		</div>
	);
};

export default Page;
