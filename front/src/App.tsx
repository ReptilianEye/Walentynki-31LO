import React from "react"
import { Routes, Route } from "react-router-dom"
import { MessagesDisplay } from "./MessagesDisplay"
import { AdminDashboard } from "./AdminDashboard"
import "./App.css"
import { MessageForm } from "./MessageForm"

const App = () => {
	return (
		<main className="app">
			<main>
				<Routes>
					<Route path="/" element={<MessagesDisplay />} />
					<Route path="/new" element={<MessageForm />} />
					<Route path="/admin" element={<AdminDashboard />} />
				</Routes>
			</main>
		</main>
	)
}

export default App
