import { useState, useEffect } from "react";
import { Server, Socket } from "../assets/sockets";
import questionsJSON from "../assets/questions.json";
import Slider from "../components/Slider";
import ButtonSelect from "../components/ButtonBoolean";
type Player = {
    name: string;
};
interface IServer extends Server {
    start: () => void;
    properties: { autoskip: boolean; count: number };
    ingame: {
        count: number;
        showNext:boolean
    };
    nextround:()=>void;
    setproperties:(a:{ autoskip: boolean; count: number })=>void;
}
function App() {
    const [Clients, SetClients] = useState<Map<string, Player>>(new Map());
    const [iserver, SetIServer] = useState<IServer | undefined>(undefined);
    const [started, SetStarted] = useState<boolean>(false);

    // Settings
    const [qSize, SetQSize] = useState<number>(10);
    const [qAutoSkip, SetQAutoSkit] = useState<boolean>(true);

    const currentQuestion = useState<{
        question: string;
        answers: { answer: string; votes: number }[] | string[] | undefined;
    }>();
    useEffect(() => {
        document.title = "Host";

        // Gather information
        const questionsMap = new Map(questionsJSON.questions.map((v, i) => [i, v]));

        requestAnimationFrame(() => {
            // Start The Server
            const clients = new Map<
                string,
                {
                    socket: Socket;
                    player: Player;
                }
            >();

            const update = {
                clients: () => {
                    const xmap = new Map<string, Player>();
                    for (const xplayer of clients) {
                        xmap.set(xplayer[0], xplayer[1].player);
                    }
                    SetClients(xmap);
                },
            };

            type Round = {
                question: string;
                answers: undefined | Map<string, string>;
                votes: undefined | string[];
            };
            const rollQuestion = (): string => {
                if (questionsMap === undefined) return "";
                const _keys = Array.from(questionsMap.keys());
                const currentKey = _keys[Math.floor(Math.random() * _keys.length)];
                const qstr = questionsMap.get(currentKey);
                questionsMap.delete(currentKey);
                return qstr as string;
            };

            const currentRound = {
                question: "",
            } as Round;

            let iserver: IServer | undefined = undefined;
            const server = new Server(
                (id: string, serv: Server) => {
                    serv.code = id;
                    iserver = serv as IServer;
                    iserver.setproperties = (x)=>{
                        if (iserver !== undefined) iserver.properties = x;
                        console.log(iserver);
                    }
                    iserver.start = gameStart;
                    iserver.ingame = {
                        count: 0,
                        showNext:false
                    };
                    iserver.nextround = ()=>{}
                    console.log(iserver);
                    SetIServer(iserver);
                    return undefined;
                },
                (s, serv) => {
                    s.on("name", (name: string) => {
                        clients.set(s.id, { socket: s, player: { name: name } });
                        console.log("name", name);
                        update.clients();
                        serv.emit = (event_name: string, args?: any) => {
                            for (const xsocket of Array.from(clients.values()).map((v) => v.socket)) {
                                xsocket.emit(event_name, args);
                            }
                        };
                    });
                    s.on("ri", (args: string) => {
                        if (typeof currentRound.answers === "undefined") {
                            currentRound.answers = new Map<string, string>();
                        }
                        currentRound.answers.set(s.id, args);

                        console.log("ri count", currentRound.answers.size, currentRound.answers.size === clients.size, clients.size);
                        if (currentRound.answers.size === clients.size) {
                            serv.emit("rc", Object.fromEntries(currentRound.answers.entries()));

                            currentQuestion[1]({
                                question: currentRound.question,
                                answers: Array.from(currentRound.answers.values()),
                            });
                        }
                    });
                    s.on("rc", (args: string) => {
                        if (typeof currentRound.votes === "undefined") {
                            currentRound.votes = [];
                        }
                        currentRound.votes.push(args);
                        console.log("rc count", currentRound.votes.length, currentRound.votes.length === clients.size, clients.size);
                        console.log(currentRound.votes);
                        if (currentRound.votes.length === clients.size && currentRound.answers !== undefined && currentRound.votes !== undefined) {
                            // show the winner
                            currentQuestion[1]({
                                question: currentRound.question,
                                answers: Array.from(currentRound.answers.values()).map((v) => {
                                    // @ts-ignore
                                    const _socket_id = Array.from(currentRound.answers.entries()).filter((v1) => v1[1] === v)[0][0];
                                    // @ts-ignore
                                    const votes = currentRound.votes.filter((v) => v === _socket_id).length;
                                    return {
                                        answer: v,
                                        votes,
                                    };
                                }),
                            });
                            if (iserver !== undefined){
                                if ( iserver.properties.autoskip) {
                                    setTimeout(() => {
                                        gameStart();
                                        if (iserver !== undefined) {
                                            iserver.ingame.count += 1;
    
                                            if (iserver.ingame.count >= iserver.properties.count) {
                                                // NOW SET THE WINNER!!
                                            }
                                            SetIServer(iserver);
                                        }
                                    }, 5000);
                                }
                                else {
                                    iserver.nextround = ()=>{
                                        gameStart();
                                        if (iserver !== undefined) {
                                            iserver.ingame.count += 1;
    
                                            if (iserver.ingame.count >= iserver.properties.count) {
                                                // NOW SET THE WINNER!!
                                            }
                                            iserver.ingame.showNext = false;
                                            SetIServer(iserver);
                                        }
                                        
                                    }
                                    iserver.ingame.showNext = true;
                                    SetIServer(iserver);
                                }
                            }
                           
                        }
                    });
                }
            );

            function gameStart() {
                currentRound.question = rollQuestion();
                currentRound.answers = undefined;
                currentRound.votes = undefined;
                server.emit("ri");
                currentQuestion[1]({
                    question: currentRound.question,
                    answers: undefined,
                });
            }
        });
    }, []);

    function Copy(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        if (iserver === undefined) return;
        const xelement = e.currentTarget;
        navigator.clipboard.writeText(iserver.code);
        xelement.innerHTML = "COPIED!";
        xelement.style.cursor = "default";
        xelement.style.animationPlayState = "paused";
        setTimeout(() => {
            xelement.innerHTML = iserver.code;
            xelement.style.cursor = "";
            xelement.style.animationPlayState = "";
        }, 1500);
    }
    return (
        <>
            {iserver !== undefined ? (
                <>
                    {started === true ? (
                        <>
                            <h3 style={{opacity:0.5}} key={"header"}>
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
                            <main>
                                {currentQuestion[0] === undefined ? (
                                    <img className="loading" src="Infinity-1s-200px.gif" alt="" />
                                ) : (
                                    <>
                                        <p style={{ opacity: 0.5, letterSpacing: 2, fontFamily: "monospace", marginBottom: 0, fontSize: 20 }}>
                                            {" "}
                                            the question is{" "}
                                        </p>
                                        <p style={{ fontFamily: "consolas", fontSize: 30 }}>{currentQuestion[0].question}</p>
                                        {currentQuestion[0].answers !== undefined ? (
                                            <>
                                                <p style={{ opacity: 0.5, letterSpacing: 2, fontFamily: "monospace", marginBottom: 0, fontSize: 20 }}>
                                                    {" "}
                                                    users answers are{" "}
                                                </p>
                                                <div className="answergrid">
                                                    {currentQuestion[0].answers.map((v, i) => {
                                                        if (typeof v === "string") {
                                                            return (
                                                                <p className="answer" key={i}>
                                                                    {v}
                                                                </p>
                                                            );
                                                        } else {
                                                            return (
                                                                <p className="answer" key={i}>
                                                                    {v.answer} | {v.votes}
                                                                </p>
                                                            );
                                                        }
                                                    })}
                                                </div>

                                                {iserver.ingame.showNext ? <>
                                                <br />
                                                <br />
                                                    <button onClick={()=>{
                                                    iserver.nextround()
                                                }}>Next Question</button>
                                                </> : <></>}
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </>
                                )}
                            </main>
                            <footer>
                                <progress value={iserver.ingame.count} max={iserver.properties.count}></progress>
                                <div>
                                    <button
                                        onClick={() => {
                                            iserver.start();
                                        }}
                                    >
                                        Restart Question
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.location.href = "/trivia/";
                                        }}
                                    >
                                        Stop Server
                                    </button>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <>
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
                                        @coder-1t45
                                    </p>
                                </h3>
                                <div className="main-host-list">
                                    <div style={{ flexGrow: 2, borderRight: "3px solid white", paddingRight: 15 }}>
                                        <h5>Player List</h5>
                                        <br />
                                        {Array.from(Clients.values()).map((v, i) => (
                                            <p key={"pname" + i} className="name">
                                                {v.name}
                                            </p>
                                        ))}
                                    </div>
                                    <div style={{ flexGrow: 1, position: "relative" }}>
                                        <div className="center">
                                            <h5> The code for Joining is</h5>
                                            <br />
                                            <center>
                                                {" "}
                                                <span className="code" onDoubleClick={(e) => Copy(e)}>
                                                    {iserver.code}
                                                </span>
                                            </center>
                                            <br />

                                            <h5>how many questions?</h5>
                                            <center>
                                                <Slider
                                                    step={1}
                                                    min={10}
                                                    max={50}
                                                    defualtValue={qSize}
                                                    onValue={(d) => {
                                                        SetQSize(d);
                                                    }}
                                                />
                                            </center>
                                            <h5>who switch questions?</h5>
                                            <center>
                                                <ButtonSelect
                                                    defualtValue={qAutoSkip}
                                                    trueText="Auto"
                                                    falseText="Host"
                                                    onValue={(b) => {
                                                        SetQAutoSkit(b);
                                                    }}
                                                />
                                            </center>
                                        </div>
                                    </div>
                                </div>
                                <center>
                                    <button
                                        style={{ marginTop: 50 }}
                                        onClick={() => {
                                            console.log('qAutoSkip',qAutoSkip)
                                            iserver.setproperties({
                                                autoskip: qAutoSkip,
                                                count: qSize,
                                            });
                                            iserver.start();
                                            SetStarted(true);
                                        }}
                                    >
                                        start
                                    </button>
                                </center>
                            </main>
                        </>
                    )}
                </>
            ) : (
                <>
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
                                @coder-1t45
                            </p>
                        </h3>

                        <center>
                            <img className="loading" src="Infinity-1s-200px.gif" alt="" />
                        </center>
                    </main>
                </>
            )}
        </>
    );
}

export default App;
