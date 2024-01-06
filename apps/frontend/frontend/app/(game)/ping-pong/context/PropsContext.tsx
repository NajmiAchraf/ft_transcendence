'use client';

import { createContext, useContext, useState } from "react";
import { Props } from "@/app/(game)/ping-pong/common/Common";

export interface IPropsContext {
	props: Props;
	setProps: React.Dispatch<React.SetStateAction<Props>>;
}

//create context
const PropsContext = createContext<IPropsContext | undefined>(undefined);

// use context
export function usePropsContext() {
	const context = useContext(PropsContext);

	if (context === undefined) {
		throw new Error("Props context not defined");
	}

	return context;
}

// default props
export function getDefaultProps(): Props {

	const defaultProps: Props = {
		devMode: 'none',
		geometry: "cube",
		style: "mirror",
		scene: "dast",
		mode: "medium",
		side: "right",
		playerType: "player",
		player1ID: '0',
		player2ID: '0',
		player1Name: "name",
		player2Name: "name",
		player1Avatar: "/img3.png",
		player2Avatar: "/img3.png",
	};

	return defaultProps;
}

// context provider
function PropsContextProvider({ children }: { children: React.ReactNode }) {
	const [props, setProps] = useState<Props>(getDefaultProps());

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
