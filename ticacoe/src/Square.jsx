import React from 'react'
import './Square.css'
export  default function Square(props) {
    return (
        <button disabled={props.disabled} className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}