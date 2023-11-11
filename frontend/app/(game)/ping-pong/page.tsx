'use client'

import React from 'react';
import dynamic from 'next/dynamic'

import '../index.css'
import { PropsContextProvider } from './context/PropsContext';

const StartPingPong = dynamic(() => import('./component/StartPingPong'), { ssr: false })

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
