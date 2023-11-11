'use client'

import React from 'react';
import dynamic from 'next/dynamic'

import '../index.css'
import { PropsContextProvider } from './context/PropsContext';
import { WebSocketContextProvider } from '../context/WebSocketContext';

const StartPingPong = dynamic(() => import('./component/StartPingPong'), { ssr: false })

const Page = () => {
	return (
		<div id="root" style={{ backgroundColor: "#000000" }}>
			<React.StrictMode>
				<WebSocketContextProvider>
					<PropsContextProvider>
						<StartPingPong />
					</PropsContextProvider>
				</WebSocketContextProvider>
			</React.StrictMode>
		</div>
	);
};

export default Page;
