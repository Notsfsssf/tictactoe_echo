import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
} from "react";
import Board from "./Board";
import "./Game.css";
import useWebSocket from "react-use-websocket";
function Game(props) {

  const index = props.location.state.index;
  const iso = index % 2 === 0;
  const wsUrl = "ws://127.0.0.1:1323/ws/" + props.match.params.id;
  const [sendMessage, lastMessage, readyState] = useWebSocket(wsUrl);
  const [name, setName] = useState(props.match.params.id);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [win, setWin] = useState("");

  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      eHandleStep(JSON.parse(lastMessage.data));
    }
  }, [lastMessage]);
  function eHandleStep(i) {
    console.log(i);
    var maybeWin = "O";
    const sq = squares;
    if (i.iso) {
      sq[i.position] = "O";
    } else {
      sq[i.position] = "X";
      maybeWin = "X";
    }
    setSquares(sq.slice(0));
    if (calculateWinner(squares)) {
      setWin(maybeWin);
    }
  }
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }

  function handleClick(i) {
  
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const message = JSON.stringify({ position: i, iso: iso });
    sendMessage(message);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={squares} onTap={i => handleClick(i)} />
      </div>
      <div className="game-info">
        <div>status:{win}</div>
        <div>status:{squares}</div>
      </div>
    </div>
  );
}

export default Game;
