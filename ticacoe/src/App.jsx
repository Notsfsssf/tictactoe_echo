import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Game from "./Game";
import { Route, Switch } from "react-router-dom";
import Welcome from "./Welcome";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path={"/game/:id"} component={Game} />
        <Route path={"/"} component={Welcome} />
      </Switch>
    </div>
  );
}

export default App;
