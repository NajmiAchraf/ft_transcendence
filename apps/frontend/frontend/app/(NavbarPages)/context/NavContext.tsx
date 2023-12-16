'use client';

import { createContext, useContext, useEffect, useState } from "react";

export interface INavContext {
    nav: string;
    setNav: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    id: number;
    setId: React.Dispatch<React.SetStateAction<number>>;
    infoSec: string;
    setinfoSec: React.Dispatch<React.SetStateAction<string>>;
    TwoFACode: string;
    setTwoFACode: React.Dispatch<React.SetStateAction<string>>;
    is2FA: boolean;
    setIs2FA: React.Dispatch<React.SetStateAction<boolean>>;
    isUpdated: boolean;
    setisUpdated: React.Dispatch<React.SetStateAction<boolean>>;
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
    const [id, setId] = useState(0);
    const [infoSec, setinfoSec] = useState("0");
    const [isLoading, setIsLoading] = useState(true);
    const [TwoFACode, setTwoFACode] = useState("");
    const [is2FA, setIs2FA] = useState(false);
    const [isUpdated, setisUpdated] = useState(false);
    const contextValue: INavContext = {
        nav,
        setNav,
        isLoading,
        setIsLoading,
        id,
        setId,
        infoSec,
        setinfoSec,
        TwoFACode,
        setTwoFACode,
        is2FA,
        setIs2FA,
        isUpdated,
        setisUpdated
    }

    return (
        <NavContext.Provider value={contextValue}>
            {children}
        </NavContext.Provider>
    );
};


export default NavContextProvider;
