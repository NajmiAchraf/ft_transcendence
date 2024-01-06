import React, { useEffect, useState } from "react";
import { getCookie } from "./errorChecks";
import { useNavContext } from "../(NavbarPages)/context/NavContext";
import { useRouter } from "next/navigation";
import { hasAlphabets } from "./errorChecks";
type DefaultData = {
    username: string;
    privacy: string;
    avatar: string;
    nickname: string;
    two_factor_auth: string;
};

const Settings = ({ userId }: { userId: number }) => {
    const [previewSrc, setPreviewSrc] = useState<string | ArrayBuffer | null>('');
    const [defaultData, setDefaultData] = useState<DefaultData | null>(null);
    const [nickname, setNickname] = useState<string>("");
    const [privacy, setprivacy] = useState<string>("");
    const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(false);
    const nav = useNavContext()
    const router = useRouter()
    const displayImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;

        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                if (e.target) setPreviewSrc(e.target.result);
            };

            reader.readAsDataURL(file);
        }
    };
    useEffect(() => {
        let el: HTMLElement | null = document.querySelector(".personal-info #settingsButton");
        if ((previewSrc === defaultData?.avatar && privacy === defaultData.privacy && nav.is2FA == Boolean(defaultData.two_factor_auth) && nickname === defaultData.nickname) || hasAlphabets(nickname) == false || /\s/.test(nickname)) {
            el?.classList.add("non-active-btn")
        }
        else {
            el?.classList.remove("non-active-btn")
        }
    }, [previewSrc, nickname, privacy, nav.is2FA])
    useEffect(() => {
        const fetchDefaultSettings = async () => {
            try {
                const data = await fetch("http://localhost:3001/user/defaultSettings", {
                    headers: {
                        Authorization: `Bearer ${getCookie("AccessToken")}`,
                    },
                });
                if (!data.ok) throw new Error("Error while fetching");
                const res = await data.json();
                console.log("Default data :", res);
                setDefaultData(res);
                setPreviewSrc(res.avatar);
                setNickname(res.nickname);
                setprivacy(res.privacy);
                setTwoFactorAuth(res.two_factor_auth);
                nav.setIs2FA(res.two_factor_auth);
            } catch (e) {
                console.log(e);
            }
        };

        fetchDefaultSettings();
    }, []);

    const TwoFactorSubmit = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTwoFactorAuth(e.target.value === "ON" ? true : false)
        nav.setIs2FA(e.target.value === "ON" ? true : false)
        if (e.target.value === "ON" && !defaultData?.two_factor_auth) {
            try {
                console.log("XDXDXDXD")
                const data = await fetch("http://localhost:3001/user/2factorQr", {
                    headers: {
                        Authorization: `Bearer ${getCookie("AccessToken")}`,
                    },
                });
                if (!data.ok) throw new Error("Error while fetching");
                const res = await data.json()
                console.log("HA RESUTLS ASA7BI :", res)
                let element = document.querySelector("._2factor img") as HTMLImageElement;
                element.src = res.img;
                if (element.parentElement)
                    element.parentElement.style.display = "flex";
            } catch (e) {
                console.log("Ha wa7ed lerror :", e)
            }
        }
    };
    const SubmitSettings = async () => {
        const formData = new FormData(document.getElementById('settingsform') as HTMLFormElement);
        let obj = null;
        formData.forEach((value, key) => {
            if (key === "avatar")
                obj = value;
            console.log(key, " : ", value)
        })
        console.log(formData)
        const url: string = (previewSrc === defaultData?.avatar ? "http://localhost:3001/user/settings" : "http://localhost:3001/user/settingsAvatar")
        try {
            console.log("ha ach kansift :", JSON.stringify({ avatar: (previewSrc === defaultData?.avatar ? previewSrc : obj), privacy: privacy, nickname, two_factor_auth: nav.is2FA ? "ON" : "OFF" }))
            const data = await fetch(url, (previewSrc === defaultData?.avatar ? {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                },
                body: JSON.stringify({ avatar: previewSrc, privacy: privacy, nickname, two_factor_auth: nav.is2FA ? "ON" : "OFF" })
            } : {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getCookie("AccessToken")}`
                },
                body: formData
            }))
            if (!data.ok) {
                if (data.status == 400)
                {
                    const el = document.querySelector(".nickname-input") as HTMLElement
                    if (el)
                    {
                        el.style.animation = "none";
                        setTimeout(() =>{el.style.animation = "shakeX 1s forwards";}, 200)
                    }
                }
                else if (data.status == 413)
                {
                    const el = document.querySelector(".picture-section .picture") as HTMLElement
                    if (el)
                    {
                        el.style.animation = "none";
                        setTimeout(() =>{el.style.animation = "shakeX 1s forwards";}, 200)
                    }
                }
                throw new Error("something went wrong")
            }
            const res = await data.json()
            router.push(`/updated/${nav.id}`)
        }
        catch (e) {
            if (e instanceof Error)
                console.log(e.message)
        }
    }
    return (
        <form onSubmit={(e) => e.preventDefault()} id="settingsform" className="settings-form">
            <div className="picture-section">
                <div className="picture">
                    <img src={previewSrc as string} />
                    <div className="upload-input">
                        <label htmlFor="upload-photo">Upload Avatar</label>
                        <input name="avatar" id="upload-photo" style={{ display: "none" }} type="file" placeholder="xd" onChange={displayImage} accept="image/*"></input>
                    </div>
                </div>
            </div>
            <div className="personal-info">
                <h3>{defaultData?.username}</h3>
                <label>Nickname :</label>
                <input className="nickname-input" name="nickname" type="text" placeholder="Username" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                <label>Privacy :</label>
                <div className="custom-select">
                    <select name="privacy" value={privacy} onChange={(e) => setprivacy(e.target.value)}>
                        <option value="public">public</option>
                        <option value="private">private</option>
                    </select>
                    <div className="select-arrow">
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.4083 6.74155C3.3677 6.702 3.1941 6.55265 3.0513 6.41354C2.1532 5.59795 0.6832 3.47034 0.2345 2.35675C0.1624 2.18763 0.0098 1.76006 0 1.53161C0 1.31271 0.0504 1.10404 0.1526 0.90492C0.2954 0.656698 0.5201 0.457574 0.7854 0.348466C0.9695 0.278227 1.5204 0.169118 1.5302 0.169118C2.1329 0.0600097 3.1122 0 4.1944 0C5.2255 0 6.1649 0.0600097 6.7767 0.149342C6.7865 0.159571 7.4711 0.26868 7.7056 0.388018C8.134 0.606917 8.4 1.03449 8.4 1.49206V1.53161C8.3895 1.82962 8.1235 2.45631 8.1137 2.45631C7.6643 3.50989 6.2664 5.58841 5.3375 6.42377C5.3375 6.42377 5.0988 6.65904 4.9497 6.76132C4.7355 6.9209 4.4702 7 4.2049 7C3.9088 7 3.633 6.91067 3.4083 6.74155Z" fill="#8F8F8F" />
                        </svg>
                    </div>
                </div>
                <label>2FA :</label>
                <div className="custom-select">
                    <select name="two_factor_auth" value={(nav.is2FA ? "ON" : "OFF")} onChange={(e) => TwoFactorSubmit(e)}>
                        <option value="ON">ON</option>
                        <option value="OFF">OFF</option>
                    </select>
                    <div className="select-arrow">
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.4083 6.74155C3.3677 6.702 3.1941 6.55265 3.0513 6.41354C2.1532 5.59795 0.6832 3.47034 0.2345 2.35675C0.1624 2.18763 0.0098 1.76006 0 1.53161C0 1.31271 0.0504 1.10404 0.1526 0.90492C0.2954 0.656698 0.5201 0.457574 0.7854 0.348466C0.9695 0.278227 1.5204 0.169118 1.5302 0.169118C2.1329 0.0600097 3.1122 0 4.1944 0C5.2255 0 6.1649 0.0600097 6.7767 0.149342C6.7865 0.159571 7.4711 0.26868 7.7056 0.388018C8.134 0.606917 8.4 1.03449 8.4 1.49206V1.53161C8.3895 1.82962 8.1235 2.45631 8.1137 2.45631C7.6643 3.50989 6.2664 5.58841 5.3375 6.42377C5.3375 6.42377 5.0988 6.65904 4.9497 6.76132C4.7355 6.9209 4.4702 7 4.2049 7C3.9088 7 3.633 6.91067 3.4083 6.74155Z" fill="#8F8F8F" />
                        </svg>
                    </div>
                </div>
                <button id="settingsButton" type="button" onClick={SubmitSettings}>Submit</button>
            </div>
        </form >
    );
};

export default Settings;