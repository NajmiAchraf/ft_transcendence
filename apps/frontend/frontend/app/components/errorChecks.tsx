"use client"
import { useNavContext } from "../(NavbarPages)/context/NavContext";
import { whoami } from "./PersonalInfo";
import { useRouter } from "next/navigation";
export function getValidDate(_date : string)
{
    const GameDate = new Date(_date)
    let month : number = GameDate.getMonth() + 1;
    let date : number = GameDate.getDate();
    let year : number = GameDate.getFullYear() % 100;
    return (month + "/" + date + "/" + year);
}
export function getCookie(name: string) {
    if (typeof document === 'undefined') {
        return null;
    }
    const cookies: string[] = document.cookie.split("; ")
    for (const cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.split("=")
        if (cookieKey === name)
            return decodeURIComponent(cookieValue);
    }
    return null;
}

export function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
export async function LogOut() {
    const router = useRouter()
    try {
        const data = await fetch("http://localhost:3001/auth/logout",
            {
                headers: {
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                }
            })
        deleteCookie("AccessToken");
        deleteCookie("RefreshToken");
    }
    catch (e) {
        console.log("Error in logging out :", e)
    }
    router.push("/signup")
}

export async function TokenRefresher(){
    const router = useRouter()
    try {
        console.log(getCookie("RefreshToken"))
        const data = await fetch("http://localhost:3001/auth/refresh", {
            headers: {
                Authorization: `Bearer ${getCookie("RefreshToken")}`
            }
        })
        if (!data.ok)
            throw 401;
        const res = await data.json()
        //add a header to stop the user from changing his cookies
        document.cookie = `RefreshToken=${res.refreshToken};`;
        document.cookie = `AccessToken=${res.accessToken};`;
        router.push("/home")
    } catch (e) {
        deleteCookie("AcessToken");
        deleteCookie("RefreshToken");
        router.push("/signup")
    }
}

export async function ExpirationDate(day : number)
{
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + day);

// Convert the date to a string in the required format
    const formattedExpirationDate = expirationDate.toUTCString();
    return formattedExpirationDate;
}
export async function CheckNickname() {
    const router = useRouter()
    try {
        const userId = await whoami()
        if (userId === undefined && window.location.pathname !== "/signup" && window.location.pathname !== "/2factor") {
            deleteCookie("AcessToken");
            deleteCookie("RefreshToken");
            router.push("/signup")
        }
        else {
            const data2 = await fetch("http://localhost:3001/user/personal_infos", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                },
                body: JSON.stringify({ profileId: userId })
            });

            if (!data2.ok) {
                if (data2.status === 401) {
                    if (window.location.pathname !== "/2factor" && window.location.pathname !== "/signup") {
                        TokenRefresher();
                    }
                }
            }
            const otherDataResult = await data2.json()
            if (otherDataResult.nickname === null && window.location.pathname !== "/complete_infos")
                router.push("/complete_infos")
            if (userId !== undefined && otherDataResult.nickname !== null && (window.location.pathname === "/complete_infos" ||
                window.location.pathname === "/signup" || window.location.pathname === "/2factor"))
                router.push(`/profile/${userId}`)
        }
    }
    catch (error) {
        console.log("Error", error)
    }
}

export function hasAlphabets(str: string) {
    // Regular expression to check if the string contains alphabets
    const alphabetRegex = /[a-zA-Z]/;

    // Test if the string contains at least one alphabet character
    return alphabetRegex.test(str);
}

export function formatTimeDifference(inputDate: Date): string {
    const currentDate = new Date();
    const timeDifferenceInSeconds = Math.floor((currentDate.getTime() - inputDate.getTime()) / 1000);

    // Define time intervals in seconds
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;

    if (timeDifferenceInSeconds < minute) {
        return 'Just now';
    } else if (timeDifferenceInSeconds < hour) {
        const minutes = Math.floor(timeDifferenceInSeconds / minute);
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (timeDifferenceInSeconds < day) {
        const hours = Math.floor(timeDifferenceInSeconds / hour);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(timeDifferenceInSeconds / day);
        return `${days}d ago`;
    }
}

export function formatChatDate(inputDate: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(inputDate, today)) {
        return `Today ${formatTime(inputDate)}`;
    } else if (isSameDay(inputDate, yesterday)) {
        return `Yesterday ${formatTime(inputDate)}`;
    } else {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        };
        return inputDate.toLocaleDateString('en-US', options);
    }
}

// Helper function to format the time as HH:mm
function formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric' };
    return date.toLocaleTimeString('en-US', options);
}

// Helper function to check if two dates represent the same day
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}
export function formatGameTime(duration : number) {
        const totalSeconds = Math.floor(duration / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return formattedDuration;
}
      