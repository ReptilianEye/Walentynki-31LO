import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Message, MessageInfo } from "./Message"
import { ID, API_BASE } from "."
import "./MessagesDisplay.css"

const report = (id: ID) => {
	fetch(API_BASE + "/report", {
		method: "POST",
		body: JSON.stringify({ id, ts: Date.now().toFixed(0) }),
	})
		.then(console.debug)
		.catch(console.error)
}

const heart = (id: ID) => {
	fetch(API_BASE + "/heart", {
		method: "POST",
		body: JSON.stringify({ id, ts: Date.now().toFixed(0) }),
	})
		.then(console.debug)
		.catch(console.error)
}

export const MessagesDisplay = (props: {}) => {
	const [messages, setMessages] = useState([] as MessageInfo[])
	const [showPrompt, setShowPrompt] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		fetch(API_BASE + "/messages")
			.then((res) => res.json())
			.then((msgs) => {
				setMessages(msgs)
				return Promise.resolve(msgs)
			})
			.then(console.debug)
			.catch(console.error)
	}, [])

	return (
		<>
			<header>
				<h1 className="decorative">
					Życzenia walentynkowe uczniów i nauczycieli Liceum
					Ogólnokształcącego nr 31 w Krakowie.
				</h1>
			</header>

			{showPrompt ? (
				<Message
					heartCallback={() => {
						navigate("/new")
					}}
					reportCallback={() => {
						setShowPrompt(false)
					}}
					id="00000000-0000-0000-0000-000000000000"
					highlight={true}
					recipient="Hej!"
					content="Kliknij na serce aby złożyć własne życzenia!"
					hearts={"->" as any}
				/>
			) : (
				<></>
			)}

			<div className="messages">
				{messages.map((message) => (
					<Message
						key={message.id}
						heartCallback={(id) => {
							heart(id)
							setMessages(
								messages.map((msg) => {
									if (msg.id !== id) {
										return msg
									}

									msg.hearts = (msg.hearts || 0) + 1
									return msg
								})
							)
						}}
						reportCallback={report}
						{...message}
					/>
				))}
			</div>

			<footer>
				<p>
					Strona zrobiona przez{" "}
					<a href="mailto:jan.markiewicz@lo31.krakow.pl">
						Jana Markiewicza
					</a>{" "}
					i{" "}
					<a href="mailto:piotr.rzadkowski@lo31.krakow.pl">
						Piotra Rzadkowskiego
					</a>
					.
				</p>
			</footer>
		</>
	)
}
