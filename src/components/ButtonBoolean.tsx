import { useState } from "react";

export default function ButtonSelect({
    defualtValue,
    trueText,
    falseText,
    onValue
}: {
    defualtValue?:boolean,
    trueText?:string,
    falseText?:string,
    onValue?:(b:boolean)=>void
}) {
    const n = useState<boolean>(defualtValue ?? false);

    return (
        <div className="buttonselect" style={{
            width:"fit-content",
            marginTop:10
        }}>
            <button data-selected={n[0]===true} onClick={()=>{
                n[1](true);
                onValue?.(true);
            }} >{trueText??"yes"}</button>
            <button data-selected={n[0]===false} onClick={()=>{
                n[1](false);
                onValue?.(false);
            }} >{falseText??"no"}</button>
        </div>
    );
}
