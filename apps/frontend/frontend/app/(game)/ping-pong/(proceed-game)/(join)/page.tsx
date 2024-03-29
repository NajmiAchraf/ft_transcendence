'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

import Service from '@/app/(game)/ping-pong/(proceed-game)/service/Service';
import { getDefaultOptions, useOptionsContext } from '@/app/(game)/ping-pong/context/OptionsContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { GameStates } from '@/app/(game)/ping-pong/common/Common';
import '@/app/(game)/ping-pong.css'

const PlayPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/PlayPingPong'), { ssr: false });
const SettingPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/SettingPingPong'), { ssr: false });
const WaitPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/WaitPingPong'), { ssr: false });

const Join = () => {
	const optionsContext = useOptionsContext();
	const propsContext = usePropsContext();
	const [gameState, setGameState] = useState<GameStates>("settings");

	optionsContext.options = getDefaultOptions();

	propsContext.props = {
		...propsContext.props,
		playerType: "player",
	};

	// run service for socket and game
	Service(setGameState);

	return (
		<div className="Game">
			{gameState === "settings" && <SettingPingPong />}
			{gameState === "wait" && <WaitPingPong />}
			{gameState === "play" && <PlayPingPong />}
		</div>
	);
};

export default Join;
