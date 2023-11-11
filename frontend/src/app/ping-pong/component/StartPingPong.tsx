import SettingPingPong from './SettingPingPong';
import PlayPingPong from './PlayPingPong';
import { usePropsContext } from '../context/PropsContext';

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
