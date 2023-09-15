import { useEffect, useState } from "react";
import { Socket, io } from "../assets/sockets";

function App() {
    useEffect(() => {
        document.title = "Play";
    }, []);

    const [code, SetCode] = useState<string>();
    const [name, SetName] = useState<string>();
    const [socket, SetSocket] = useState<Socket>();

    const [requestState, SetRequestState] = useState<boolean | { [key: string]: string }>(false);
    useEffect(() => {
        if (socket === undefined) return;
        socket.on("ri", () => {
            SetRequestState(true);
        });
        socket.on("rc", (args: { [key: string]: string }) => {
            console.log("rc args", JSON.stringify(args));
            SetRequestState(args);
        });
        socket.emit("name", name);
    }, [socket]);
    return (
        <main>
            {" "}
            {socket === undefined ? (
                <>
                    <h3 key={"header"}>
                        <img src="white.png" alt="" />
                        <span>t</span>
                        <span>r</span>
                        <span>ι</span>

                        <span>ν</span>
                        <span>ι</span>
                        <span>α</span>
                        {/* <span>trινια</span> */}
                        <p
                            onClick={() => {
                                document.location.href = "/Coder-1t45";
                            }}
                        >
                            @coder-1t45
                        </p>
                    </h3>
                    <input
                        type="text"
                        placeholder="CODE"
                        onChange={(e) => {
                            SetCode(e.currentTarget.value);
                        }}
                    />
                    <input
                        type="text"
                        placeholder="NAME"
                        onChange={(e) => {
                            SetName(e.currentTarget.value);
                        }}
                    />
                    <br />
                    <center>
                        <button
                            disabled={
                                code === undefined ||
                                (typeof code === "string" && code.length < 3) ||
                                name === undefined ||
                                (typeof name === "string" && name.length < 3)
                            }
                            onClick={async (e) => {
                                if (e.currentTarget.disabled || code === undefined) return;
                                SetSocket(await io(code));
                            }}
                        >
                            join
                        </button>
                    </center>
                </>
            ) : (
                <>
                <h3 key={"header"}>
                            <img src="white.png" alt="" />
                            <span>t</span>
                            <span>r</span>
                            <span>ι</span>

                            <span>ν</span>
                            <span>ι</span>
                            <span>α</span>
                            {/* <span>trινια</span> */}
                            <p
                                onClick={() => {
                                    document.location.href = "/Coder-1t45";
                                }}
                            >
                                @coder-1t45
                            </p>
                        </h3>
                    {typeof requestState !== "boolean" ? (
                        <>
                        <div className="answergrid">
                        {Object.entries(requestState).map((v) => (
                                <button className="answer"
                                    onClick={() => {
                                        socket.emit("rc", v[0]);
                                        SetRequestState(false);
                                    }}
                                >
                                    {v[1]}
                                </button>
                            ))}
                        </div>
                           
                        </>
                    ) : requestState === true ? (
                        <>
                            <input type="text" id="request-input" />
                            <center>
                                <button
                                    onClick={() => {
                                        const inp = document.querySelector("input#request-input");
                                        if (inp === null) return;
                                        const inpinp = inp as HTMLInputElement;
                                        // response input
                                        socket.emit("ri", inpinp.value);
                                        SetRequestState(false);
                                    }}
                                >
                                    submit
                                </button>
                            </center>
                        </>
                    ) : (
                        <center><img src="Radio-1s-200px.gif" style={{ scale: "80" }} className="loading" alt="" /></center>
                    )}
                </>
            )}
        </main>
    );
}

export default App;
