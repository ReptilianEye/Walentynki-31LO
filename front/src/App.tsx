import React from "react"
import { MessagesDisplay } from "./MessagesDisplay"
import "./App.css"

const App = () => (
	<main className="app">
		<h1 className="decorative">
			Życzenia walentynkowe uczniów i nauczycieli Liceum
			Ogólnokształcącego nr 31 w Krakowie.
		</h1>

		<MessagesDisplay />
	</main>
)

export default App
