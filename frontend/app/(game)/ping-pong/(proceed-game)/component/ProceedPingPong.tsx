'use client';

import { usePropsContext } from '../../context/PropsContext';

import PlayPingPong from '../../service/PlayPingPong'
import SettingPingPong from './SettingPingPong'

function ProceedPingPong() {
	const propsContext = usePropsContext();
	return (
		!propsContext.props.inGame ? (
			<SettingPingPong />
		) : (
			<PlayPingPong />
		)
	);
}

export default ProceedPingPong;
