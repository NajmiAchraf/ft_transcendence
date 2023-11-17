'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { Props } from "../(game)/ping-pong/common/Common";

export interface IPropsContext {
	props: Props;
	setProps: React.Dispatch<React.SetStateAction<Props>>;
}

//create context
const PropsContext = createContext<IPropsContext | undefined>(undefined);

//! Function to merge default values with existing props
function mergeDefaultProps(existingProps: Props): Props {
	return {
		...existingProps,
		geometry: "cube",
		mirror: false,
		mode: "medium",
		playerType: "player",
		invite: false,
		inGame: false,
		endGame: false,
		startPlay: false,
	};
}

// use context
export function usePropsContext() {
	const context = useContext(PropsContext);

	if (context === undefined) {
		throw new Error("Props context not defined");
	}

	return context;
}

//! default context
export function useDefaultPropsContext() {
	const context = usePropsContext();

	useEffect(() => {
		// Merge default props with existing props when the component mounts
		// context.setProps((context.props) => mergeDefaultProps(context.props));
	}, []); // Run this effect only once when the component mounts

	return context;
}

// context provider
function PropsContextProvider({ children }: { children: React.ReactNode }) {
	const [props, setProps] = useState<Props>({
		geometry: "cube",
		mirror: false,
		mode: "medium",
		playerType: "player",
		invite: false,
		inGame: false,
		endGame: false,
		startPlay: false,
	});

	const contextValue: IPropsContext = {
		props,
		setProps,
	};

	return (
		<PropsContext.Provider value={contextValue}>
			{children}
		</PropsContext.Provider>
	);
}

export default PropsContextProvider;
