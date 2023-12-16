const signup = () => {
    const fetchfunc = async () => {
        /*const ft = await fetch("http://localhost:3001/auth/intra/login")
        const data = await ft.json()*/
        //console.log("hi")
        /*fetch("http://localhost:3001/auth/intra/login", { method: "GET", redirect: "follow" })
            .then((response) => response.json())
            .then((json) => console.log(json))
            .catch(function (err) {
                console.info(err + " url: ");
            });*/
    }
    return (
        <>
            <a href="http://localhost:3001/auth/intra/redirect">intra</a>
        </>
    );
}

export default signup;