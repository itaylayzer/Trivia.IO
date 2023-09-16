import { useState, useEffect } from "react";
import { Server, Socket } from "../assets/sockets";
import questionsJSON from "../assets/questions.json";
import Slider from "../components/Slider";
import ButtonSelect from "../components/ButtonBoolean";
import SequencesList from "../components/SequencesList";
type Player = {
    name: string;
    coins: number;
};
interface IServer extends Server {
    start: () => void;
    properties: { autoskip: boolean; count: number };
    ingame: {
        count: number;
        showNext: boolean;
    };
    nextround: () => void;
    setproperties: (a: { autoskip: boolean; count: number }) => void;
    setList:(l:Array<string>)=>void;
    getList:()=>Array<string>;
}
function App() {
    const [Clients, SetClients] = useState<Map<string, Player>>(new Map());
    const [iserver, SetIServer] = useState<IServer | undefined>(undefined);
    const [started, SetStarted] = useState<boolean>(false);

    // Settings
    const [qSize, SetQSize] = useState<number>(10);
    const [qAutoSkip, SetQAutoSkit] = useState<boolean>(true);
    const [showCQ, setShowCQ] = useState<boolean>(false);
    const currentQuestion = useState<{
        question: string;
        answers: { answer: string; votes: number }[] | string[] | undefined;
    }>();
    const [winner, setWinner] = useState<boolean>(false);
    useEffect(() => {
        document.title = "Host";

        // Gather information
        let questionsMap = new Map(questionsJSON.questions.map((v, i) => [i, v]));

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
            track: number;
            question: string;
            answers: undefined | Map<string, string>;
            votes: undefined | Map<string, string>;
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
            track: 0,
            question: "",
        } as Round;

        let iserver: IServer | undefined = undefined;
        const server = new Server(
            (id: string, serv: Server) => {
                serv.code = id;
                iserver = serv as IServer;
                iserver.getList = ()=>{
                    return Array.from(questionsMap.values());
                }
                iserver.setproperties = (x) => {
                    if (iserver !== undefined) iserver.properties = x;
                    console.log(iserver);
                };
                iserver.start = () => {
                    setWinner(false);
                    gameStart();
                };
                iserver.ingame = {
                    count: 0,
                    showNext: false,
                };
                iserver.setList = (l)=>{
                    function shuffle(array:string[]):string[] {
                        let currentIndex:number = array.length,  randomIndex:number;
                      
                        // While there remain elements to shuffle.
                        while (currentIndex > 0) {
                      
                          // Pick a remaining element.
                          randomIndex = Math.floor(Math.random() * currentIndex);
                          currentIndex--;
                      
                          // And swap it with the current element.
                          [array[currentIndex], array[randomIndex]] = [
                            array[randomIndex], array[currentIndex]];
                        }
                      
                        return array;
                      }
                    if (iserver) iserver.getList = ()=>{
                        return Array.from(questionsMap.values());
                    }
                    questionsMap = new Map(shuffle(l).map((v, i) => [i, v]));
                }
                
                iserver.nextround = () => {};
                console.log(iserver);
                SetIServer(iserver);
                return undefined;
            },
            (s, serv) => {
                s.on("name", (name: string) => {
                    clients.set(s.id, { socket: s, player: { name: name, coins: 0 } });
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
                    if (currentRound.answers.size === clients.size && currentRound.track === 0) {
                        serv.emit("rc", Object.fromEntries(currentRound.answers.entries()));
                        currentRound.track = 1;
                        currentQuestion[1]({
                            question: currentRound.question,
                            answers: Array.from(currentRound.answers.values()),
                        });
                    }
                });
                s.on("disconnect", () => {
                    const sId = s.id;
                    clients.delete(sId);
                    if (clients.size === 0) {
                        window.location.reload();
                    }
                    update.clients();
                });
                s.on("rc", (args: string) => {
                    if (typeof currentRound.votes === "undefined") {
                        currentRound.votes = new Map();
                    }
                    currentRound.votes.set(s.id, args);
                    if (
                        currentRound.track === 1 &&
                        currentRound.votes.size === clients.size &&
                        currentRound.answers !== undefined &&
                        currentRound.votes !== undefined
                    ) {
                        currentRound.track = 0;
                        // show the winner
                        currentQuestion[1]({
                            question: currentRound.question,
                            answers: Array.from(currentRound.answers.values()).map((v) => {
                                // @ts-ignore
                                const _socket_id = Array.from(currentRound.answers.entries()).filter((v1) => v1[1] === v)[0][0];
                                // @ts-ignore
                                const votes = Array.from(currentRound.votes.values()).filter((v) => v === _socket_id).length;
                                return {
                                    answer: v,
                                    votes,
                                };
                            }),
                        });
                        if (iserver !== undefined) {
                            setTimeout(() => {
                                function countElements(arr: string[]): { [key: string]: number } {
                                    const result: { [key: string]: number } = {};

                                    for (const element of arr) {
                                        if (result[element]) {
                                            result[element]++;
                                        } else {
                                            result[element] = 1;
                                        }
                                    }

                                    return result;
                                }
                                // add coins to each player!
                                const coinsper = 100;
                                // @ts-ignore
                                const countObjs = countElements(Array.from(currentRound.votes.values()));
                                // @ts-ignore
                                for (const x of Array.from(currentRound.votes.entries())) {
                                    if (!Object.keys(countObjs).includes(x[1])) continue;
                                    const xplayer = clients.get(x[0]);
                                    if (xplayer === undefined) continue;
                                    const cAddons = coinsper * countObjs[x[1]];
                                    xplayer.player.coins += cAddons;

                                    xplayer.socket.emit("cn", [xplayer.player.coins, cAddons]);
                                    const xelements = document.querySelectorAll(`p.sideMoneyAnim`);
                                    for (const xelement of xelements) {
                                        if (xelement.getAttribute("data-user") !== x[0]) continue;

                                        const pelement = xelement as HTMLParagraphElement;

                                        pelement.style.animation = "sideMoneyAnim 1.5s cubic-bezier(0.075, 0.82, 0.165, 1)";
                                        pelement.innerHTML = `+${cAddons}`;

                                        setTimeout(() => {
                                            pelement.style.animation = "";
                                            pelement.innerHTML = "";
                                        }, 1500);
                                    }
                                }
                                setTimeout(() => {
                                    update.clients();
                                }, 750);
                            }, 2000);

                            if (iserver.properties.autoskip) {
                                setTimeout(() => {
                                    if (iserver !== undefined) {
                                        iserver.ingame.count += 1;

                                        if (iserver.ingame.count >= iserver.properties.count) {
                                            // NOW SET THE WINNER!!
                                            setWinner(true);
                                        } else {
                                            gameStart();
                                        }
                                        SetIServer(iserver);
                                    }
                                }, 5000);
                            } else {
                                iserver.nextround = () => {
                                    if (iserver !== undefined) {
                                        iserver.ingame.count += 1;

                                        if (iserver.ingame.count >= iserver.properties.count) {
                                            // NOW SET THE WINNER!!
                                            setWinner(false);
                                        } else {
                                            gameStart();
                                        }
                                        iserver.ingame.showNext = false;
                                        SetIServer(iserver);
                                    }
                                };
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

    function getTrio(): { first: Player; second: Player; third: Player } {
        const x = Array.from(Clients.values()).sort((x: Player, y: Player) => {
            return x.coins - y.coins;
        });
        return {
            first: x[0],
            second: x[1],
            third: x[2],
        };
    }
    const trio = getTrio();
    return (
        <>
            {iserver !== undefined ? (
                <>
                    {started === true ? (
                        <>
                            {winner === true ? (
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
                                        <h2>the winner is</h2>
                                        <div className="winners">
                                            <div className="two">
                                                <div>
                                                    {trio.second ? (
                                                        <>
                                                            <p className="name">{trio.second.name}</p>
                                                            <p className="coin">{trio.second.coins}</p>
                                                        </>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="one">
                                                <div>
                                                    {trio.first ? (
                                                        <>
                                                            <p className="name">{trio.first.name}</p>
                                                            <p className="coin">{trio.first.coins}</p>
                                                        </>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="three">
                                                <div>
                                                    {trio.third ? (
                                                        <>
                                                            <p className="name">{trio.third.name}</p>
                                                            <p className="coin">{trio.third.coins}</p>
                                                        </>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <br />
                                        <center>
                                            <button
                                                onClick={() => {
                                                    window.location.reload();
                                                }}
                                            >
                                                New Game
                                            </button>
                                        </center>
                                    </main>
                                </>
                            ) : (
                                <>
                                    {" "}
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
                                                        <p
                                                            style={{
                                                                opacity: 0.5,
                                                                letterSpacing: 2,
                                                                fontFamily: "monospace",
                                                                marginBottom: 0,
                                                                fontSize: 20,
                                                            }}
                                                        >
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

                                                        {iserver.ingame.showNext ? (
                                                            <>
                                                                <br />
                                                                <br />
                                                                <button
                                                                    onClick={() => {
                                                                        iserver.nextround();
                                                                    }}
                                                                >
                                                                    Next Question
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </>
                                        )}
                                    </main>
                                    <div className="sidebar">
                                        {Array.from(Clients.entries())
                                            .sort((a, b) => a[1].coins - b[1].coins)
                                            .map((v) => (
                                                <div style={{ display: "flex" }}>
                                                    <p className="name">
                                                        {v[1].name} <span>{v[1].coins}</span>
                                                    </p>
                                                    <p className="sideMoneyAnim" data-user={v[0]}></p>
                                                </div>
                                            ))}
                                    </div>
                                    
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
                                                    window.location.href = "/Trivia.IO/";
                                                }}
                                            >
                                                Stop Server
                                            </button>
                                        </div>
                                    </footer>
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
                                        @coder-1t45 - 15.9.23
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
                                                    min={1}
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
                                            <center>
                                            <button style={{marginTop:10, borderRadius:10}} className="original-button scale" onClick={()=>{
                                                setShowCQ(true);
                                            }}>Edit Sentences</button>
                                            </center>
                                        </div>
                                    </div>
                                </div>
                               
                                <center>
                                    <button
                                        style={{ marginTop: 50 }}
                                        disabled={Clients.size === 0}
                                        onClick={(e) => {
                                            if (!e.currentTarget.disabled) {
                                                iserver.setproperties({
                                                    autoskip: qAutoSkip,
                                                    count: qSize,
                                                });

                                                iserver.start();
                                                SetStarted(true);
                                            }
                                        }}
                                    >
                                        start
                                    </button>
                                </center>
                            </main>
                            {
                                        showCQ ? <SequencesList defaultValue={iserver.getList()} onCancel={()=>{
                                            setShowCQ(false);
                                        }} onSubmit={(l)=>{
                                            iserver.setList(l);
                                            setShowCQ(false);
                                        }}/> : <></>
                                    }
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
                                @coder-1t45 - 15.9.23
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
