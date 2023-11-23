'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { usePropsContext } from '@/app/context/PropsContext';
import '@/app/(game)/ping-pong.css'

const PlayPingPong = dynamic(() => import('@/app/(game)/ping-pong/service/PlayPingPong'), { ssr: false });
const SettingPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/SettingPingPong'), { ssr: false });

const Invite = () => {
	const propsContext = usePropsContext();

	propsContext.props = {
		...propsContext.props,
		playerType: "player",
		invite: true,
		startPlay: false,
	}

	return (
		<div id="root" style={{ backgroundColor: "#000000" }}>
			{propsContext.props.inGame ? (
				<PlayPingPong />
			) : (
				<SettingPingPong />
			)}
		</div>
	);
};

export default Invite;
