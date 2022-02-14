import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import "./index.css"

export type ID = string

export const API_BASE = ""

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root")
)
