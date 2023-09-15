import {useEffect} from 'react';
function App() {
    useEffect(()=>{
        document.title = "Play"



    },[])

    return (
        <main>
            <h3 key={'header'}>
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
            <div className="buttons">
                <button onClick={()=>{
                    document.location.href = "/trivia/host";
                }}>host</button>
                <button onClick={()=>{
                    document.location.href = "/trivia/play";
                }}>play</button>
            </div>
        </main>
    );
}

export default App;
