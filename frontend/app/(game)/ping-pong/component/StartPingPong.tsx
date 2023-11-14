'use client';

import { usePropsContext } from '../context/PropsContext';

import PlayPingPong from './PlayPingPong'
import SettingPingPong from './SettingPingPong'

function StartPingPong() {
	const propsContext = usePropsContext();

	return (
		!propsContext.props.inGame ? (
			<SettingPingPong />
		) : (
			<PlayPingPong />
		)
	);
}

export default StartPingPong;
