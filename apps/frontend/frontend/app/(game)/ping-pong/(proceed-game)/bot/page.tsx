'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

import RootLayout from '@/app/(game)/layout';
import Service from '@/app/(game)/ping-pong/(proceed-game)/service/Service';
import { useOptionsContext } from '@/app/(game)/ping-pong/context/OptionsContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { GameStates } from '@/app/(game)/ping-pong/common/Common';
import '@/app/(game)/ping-pong.css'

const PlayPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/PlayPingPong'), { ssr: false });
const SettingPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/SettingPingPong'), { ssr: false });
const WaitPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/WaitPingPong'), { ssr: false });

const Bot = () => {
	const optionsContext = useOptionsContext();
	const propsContext = usePropsContext();
	const [gameState, setGameState] = useState<GameStates>("settings");

	optionsContext.options = {
		...optionsContext.options,
		invite: false,
		readyPlay: false,
		startPlay: false,
		endGame: false,
		inGame: false,
	};

	propsContext.props = {
		...propsContext.props,
		playerType: "bot",
	};

	// run service for socket and game
	Service(setGameState);

	return (
		<RootLayout>
			{<div id="root" style={{ backgroundColor: "#1a1c26" }}>
				{gameState === "settings" && <SettingPingPong />}
				{gameState === "wait" && <WaitPingPong />}
				{gameState === "play" && <PlayPingPong />}
			</div>}
		</RootLayout>
	);
};

export default Bot;
