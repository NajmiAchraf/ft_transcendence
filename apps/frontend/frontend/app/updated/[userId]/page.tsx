"use client"
import { useRouter, useParams } from "next/navigation";
const Updated = () => {
    const router = useRouter()
    const params = useParams()
    setTimeout(() => {
        router.push(`/profile/${params.userId}`)
    }, 1500)
    return (
        <div className="relative">
        <div className="updated-container">
            <img src="/verified.jpg"></img>
            <h3>We have successfully updated your information !</h3>
        </div>
        </div>
    );
}
export default Updated;
