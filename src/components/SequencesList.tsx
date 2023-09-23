import { useRef, useState } from "react";

export default function SequencesList({ onSubmit, onCancel, defaultValue }: { defaultValue?:Array<string>,onSubmit?: (l:Array<string>) => void; onCancel?: () => void }) {
    const [list, SetList] = useState<Array<string>>(defaultValue ?? [""]);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([null]);

    return (
        <div className="over-ui">
            <div className="sequenceList">
            <h3 style={{fontFamily:"monospace", letterSpacing:0, fontWeight:"100","fontSize":40, marginBottom:30}}>Edit Sentences</h3>
                <header style={{maxHeight:650,overflowY:"auto"}}>
                {list.map((v, i) => {
                    return (
                        <div>
                            <button style={list.length === 1?{pointerEvents:"none", opacity:0}:{}} onClick={()=>{
                                SetList((oldList) => {
                                    const newList = [];
                                    for (var x = 0; x < oldList.length; x++) {
                                        if (x !== i) newList.push(oldList[x]);
                                    }
                                    inputRefs.current[Math.max(i - 1, 0)]?.focus();
                                    return newList;
                                });
                            }} className="action minus">-</button>
                            <input
                            defaultValue={v}
                                key={"inp+seq" + i}
                                ref={(el) => {
                                    inputRefs.current[i] = el;
                                }}
                                type="text"
                                placeholder="input your sentence..."
                                onChange={(e) => {
                                    const l = JSON.parse(JSON.stringify(list)) as string[];
                                    l[i] = e.currentTarget.value;
                                    SetList(l);
                                }}
                                onKeyDown={(e) => {
                                    if (e.code === "Enter") {
                                        e.preventDefault();
                                        SetList((oldList) => {
                                            const newList = [...oldList, ""];
                                            return newList;
                                        });
                                        requestAnimationFrame(() => {
                                            inputRefs.current[i + 1]?.focus();
                                        });
                                    }
                                    if (e.currentTarget.value.length === 0 && e.code === "Backspace" && list.length > 1) {
                                        SetList((oldList) => {

                                            const newList:Array<string> = [];
                                            for (var x = 0; x < oldList.length; x++) {
                                                if (x !== i) newList.push(oldList[x]);
                                            }
                                            inputRefs.current[Math.max(i - 1, 0)]?.focus();
                                            return newList;
                                        });
                                    }
                                    if (e.code === "ArrowUp") {
                                        inputRefs.current[Math.max(i - 1, 0)]?.focus();
                                    }
                                    if (e.code === "ArrowDown") {
                                        inputRefs.current[Math.min(i + 1, inputRefs.current.length - 1)]?.focus();
                                    }
                                }}
                            ></input>
                            {i === list.length - 1 ? (
                                <>
                                    <button className="action plus"
                                        onClick={() => {
                                            SetList((oldList) => {
                                                const newList = [...oldList, ""];
                                                return newList;
                                            });
                                            requestAnimationFrame(() => {
                                                inputRefs.current[i + 1]?.focus();
                                            });
                                        }}
                                    >
                                        +
                                    </button>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    );
                })}
                </header>
                <center>
                    <div className="buttons">
                        <button
                            onClick={() => {
                                onSubmit?.(list);
                            }}
                        >
                            SUBMIT
                        </button>
                        <button
                            onClick={() => {
                                SetList([""])
                                requestAnimationFrame(()=>{
                                    if (inputRefs.current[0]) inputRefs.current[0].value = "";
                                })
                            }}
                        >
                            CLEAR
                        </button>
                        <button
                            onClick={() => {
                                onCancel?.();
                            }}
                        >
                            CANCEL
                        </button>
                    </div>
                </center>
            </div>
        </div>
    );
}
