import React, {useState} from 'react';
import './Welcome.css'
export default function Welcome(props) {
    const [name, setName] = useState('perol')

    function jumpTo() {
        var loc = window.location;
        const wsUrl = "ws://127.0.0.1:1323"+"/name/"+name
        const ws = new WebSocket(wsUrl);

        ws.onopen = function (e) {
            console.log('连接上 ws 服务端了');
        }
        ws.onmessage = (msg) => {
            console.log('接收服务端发过来的消息: %o',msg.data);
            const msgJson = JSON.parse(msg.data);
             props.history.push({ pathname:"/game/" + msgJson.id,state:msgJson})
        };
        ws.onclose = function (e) {
            console.log('ws 连接关闭了');
            console.log(e);

        }
        ws.onerror = function(e){
            console.log(e)
        }
        // props.history.push("/game/" + 1)
    }
function click(){
alert("!")
}
    return (<>
        <p className="title" onClick={click}>#OX</p>
        <input value={name} onChange={(v) => setName(v.target.value)}/>
        <button onClick={jumpTo} className="Button"/>
    </>)
}
