'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { usePropsContext, getDefaultProps } from '@/app/context/PropsContext';
import '@/app/(game)/ping-pong.css'

const PlayPingPong = dynamic(() => import('@/app/(game)/ping-pong/service/PlayPingPong'), { ssr: false });
const SettingPingPong = dynamic(() => import('@/app/(game)/ping-pong/(proceed-game)/component/SettingPingPong'), { ssr: false });

const Bot = () => {
	const propsContext = usePropsContext();
	const defaultProps = getDefaultProps();

	propsContext.props = {
		...defaultProps,
		playerType: "bot",
		invite: false,
		startPlay: false,
	};

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

export default Bot;
