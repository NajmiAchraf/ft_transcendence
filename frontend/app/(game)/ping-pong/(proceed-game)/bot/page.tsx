'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { usePropsContext } from '../../../../context/PropsContext';
import '../../../ping-pong.css'

const PlayPingPong = dynamic(() => import('../../service/PlayPingPong'), { ssr: false });
const SettingPingPong = dynamic(() => import('../component/SettingPingPong'), { ssr: false });

const Bot = () => {
	const propsContext = usePropsContext();

	propsContext.props = {
		...propsContext.props,
		playerType: "bot",
		invite: false,
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
