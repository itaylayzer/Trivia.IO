import { useEffect, useState } from "react";
import { Socket, io } from "../assets/sockets";

function App() {
    useEffect(() => {
        document.title = "Play";
    }, []);

    const [code, SetCode] = useState<string>();
    const [name, SetName] = useState<string>();
    const [socket, SetSocket] = useState<Socket>();
    const [coins, SetCoins] = useState<number>(0);
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
        socket.on("cn", (cn: [number,number]) => {
            moneyAnimation(cn[1]);
            SetCoins(cn[0]);
        });

        socket.on("disconnect", () => {
            console.error("connection got interrupt");
            SetSocket(undefined);
            SetCoins(0);
            SetRequestState(false);
        });

        socket.emit("name", name);
    }, [socket]);

    function moneyAnimation(current: number) {
        const c = current;
        const xelement = document.querySelector("p.moneyAnim#moneyAnim");
        if (xelement === null) return;
        const pelement = xelement as HTMLParagraphElement;
        pelement.innerHTML = `+${c}`;
        pelement.style.animation = "moneyanim 1.5s cubic-bezier(0.075, 0.82, 0.165, 1)";
        setTimeout(() => {
            pelement.style.animation = "";
            pelement.innerHTML = "";
        }, 1500);
    }
    return (
        <>
            {" "}
            {socket === undefined ? (
                <main>
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
                            @coder-1t45 - 15.9.23
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
                </main>
            ) : (
                <>
                    <h3 style={{ opacity: 0.5 }} key={"header"}>
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
                            @coder-1t45 - 15.9.23
                        </p>
                    </h3>
                    <main>
                        {typeof requestState !== "boolean" ? (
                            <>
                                <div className="answergrid">
                                    {Object.entries(requestState).map((v) => (
                                        <button
                                            className="answer"
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
                                <input type="text" id="request-input" placeholder="your answer?" />
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
                            <center>
                                <img src="Radio-1s-200px.gif" style={{ scale: "80" }} className="loading" alt="" />
                            </center>
                        )}
                    </main>

                    <footer>
                        <div style={{ justifyContent: "center", gap: "10px" }}>
                            <h4 style={{ height: 40, color: "gold", opacity: 1, filter: "drop-shadow(0px 0px 2px gold)" }}>{coins}</h4>
                        </div>
                    </footer>

                    <p style={{color: "gold" }} id="moneyAnim" className="moneyAnim"></p>
                </>
            )}
        </>
    );
}

export default App;
