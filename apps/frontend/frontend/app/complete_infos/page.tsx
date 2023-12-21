"use client"

import { useEffect } from "react";
import { getCookie } from "../components/errorChecks";
import { TokenRefresher } from "../components/errorChecks";
import { useRouter } from "next/navigation";
const CompleteInfos = () => {
    const router = useRouter()

    const submitinfo = async () => {
        const formData = new FormData(document.getElementById('extrainfo') as HTMLFormElement);
        /*const additionalInfo: Record<string, string> = {};

        formData.forEach((value, key) => {
            additionalInfo[key] = value as string;
        });*/
        try {
            const data = await fetch("http://localhost:3001/user/info",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${getCookie("AccessToken")}`
                    },
                    body: formData
                })
            if (!data.ok) {
                if (data.status == 401) {
                    TokenRefresher();
                }
                throw new Error("stupid ass game")
            }

            const res = await data.json()
            router.push(`/profile/${res.id}`)
        }
        catch (e) {
            console.log(e)
        }
    }
    // console.log(localStorage.getItem("AccessToken"));
    /*if (getCookie("accessToken") === null)*/
    /*const ft = await fetch('http://localhost:3001/auth/JwtTokens', { credentials: 'include' })
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch(function (err) {
            console.info(err + " url: ");
        });*/
    //}
    /*useEffect(() => {
        TokenRefresher();
    }, []);*/
    return (
        <div>
            <form id="extrainfo">
                <input type="text" id="nickname" name="nickname" required />

                <input type="text" id="fullname" name="fullname" required />

                <input type="text" id="gender" name="gender" required />

                <input type="file" id="avatar" name="avatar" accept="image/*" required />

                <button type="button" onClick={submitinfo}>Submit</button>

            </form>
            <button onClick={TokenRefresher}>click me to refresh</button>
            <h1>HAAHAHAHH</h1>
        </div>
    );
}

export default CompleteInfos;