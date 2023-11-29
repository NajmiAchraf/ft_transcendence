'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

import Service from '@/app/(game)/ping-pong/(proceed-game)/service/Service';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import '@/app/(game)/ping-pong.css'

const PlayPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/PlayPingPong'), { ssr: false });
const SettingPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/SettingPingPong'), { ssr: false });

const Bot = () => {
	const propsContext = usePropsContext();
	const [inGame, setInGame] = useState(false);

	propsContext.props = {
		...propsContext.props,
		playerType: "bot",
		invite: false,
		readyPlay: false,
		startPlay: false,
		endGame: false,
		inGame: false,
	};

	// run service for socket and game
	Service(setInGame);

	return (
		<div id="root" style={{ backgroundColor: "#000000" }}>
			{inGame ? (
				<PlayPingPong />
			) : (
				<SettingPingPong />
			)}
		</div>
	);
};

export default Bot;
