import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"

export type ID = string

// export const API_BASE = "https://walentynki.liceum31.workers.dev"
export const API_BASE = "http://localhost:5000"

ReactDOM.render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>,
	document.getElementById("root")
)
