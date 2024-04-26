import {useEffect} from 'react';
function App() {
    useEffect(()=>{
        document.title = "Trινια.io"
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
                        document.location.href = "/";
                    }}
                >
                    @itaylayzer - 10.12.23
                </p>
            </h3>
            <div className="buttons">
                <button onClick={()=>{
                    document.location.href = "/Trivia.IO/host";
                }}>host</button>
                <button onClick={()=>{
                    document.location.href = "/Trivia.IO/play";
                }}>play</button>
            </div>
        </main>
    );
}

export default App;
