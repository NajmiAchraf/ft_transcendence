"use client"
import { whoami } from "./PersonalInfo";
import { getCookie } from "./errorChecks";
import { CheckNickname } from "./errorChecks";
import { useRouter } from "next/navigation";
const Primarychecks = () => {
    const router = useRouter()
    /*console.log("IM IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIN")*/
    if (getCookie("AccessToken") === null && typeof window !== 'undefined') {
        //const router = useRouter()
        const currentPath = window.location.pathname;

        // Log the current path to the console
        if (currentPath !== "/signup" /*&& currentPath !== "/complete_ifnos"*/)
            router.push("/signup")
    }
    else {
        CheckNickname()
    }
    return (null)
}

export default Primarychecks;