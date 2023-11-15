'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

import { resetPropsContext, usePropsContext } from '../../context/PropsContext';

const ProceedPingPong = dynamic(() => import('../component/ProceedPingPong'), { ssr: false });

const Page = () => {
	const propsContext = usePropsContext();
	resetPropsContext();

	// useEffect(() => {
	// 	propsContext.props.playerType = "bot"
	// 	propsContext.props.invite = false
	// }, []);

	propsContext.props = {
		...propsContext.props,
		playerType: "bot",
		invite: false,
	}

	return (
		<div id="root" style={{ backgroundColor: "#000000" }}>
			<ProceedPingPong />
		</div>
	);
};

export default Page;
