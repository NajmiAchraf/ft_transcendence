'use client';

import { createContext, useContext, useEffect, useState } from "react";

export interface INavContext {
    nav: string;
    setNav: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

//create context
const NavContext = createContext<INavContext | undefined>(undefined);

//use context
export function useNavContext() {

    const context = useContext(NavContext)

    if (context === undefined) {
        throw new Error("context not defined");
    }

    return (context)
}

function NavContextProvider({ children }: { children: any }) {

    const [nav, setNav] = useState("0");
    const [isLoading, setIsLoading] = useState(true);
    const contextValue: INavContext = {
        nav,
        setNav,
        isLoading,
        setIsLoading
    }

    return (
        <NavContext.Provider value={contextValue}>
            {children}
        </NavContext.Provider>
    );
};


export default NavContextProvider;
