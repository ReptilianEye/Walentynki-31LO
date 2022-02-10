import { useEffect, useState } from "react"
import { Message, MessageInfo } from "./Message"
import { ID } from "."
import "./MessagesDisplay.css"

const report = (id: ID) => {
	fetch("/api/report", {
		method: "POST",
		body: JSON.stringify({ id, ts: Date.now().toFixed(0) }),
	})
		.then(console.debug)
		.catch(console.error)
}

const heart = (id: ID) => {
	fetch("/api/heart", {
		method: "POST",
		body: JSON.stringify({ id, ts: Date.now().toFixed(0) }),
	})
		.then(console.debug)
		.catch(console.error)
}

export const MessagesDisplay = (props: {}) => {
	const [messages, setMessages] = useState([] as MessageInfo[])

	useEffect(() => {
		fetch("/api/messages.json")
			.then((res) => res.json())
			.then((msgs) => {
				setMessages(msgs)
				return Promise.resolve(msgs)
			})
			.then(console.debug)
			.catch(console.error)
	}, [])

	return (
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
	)
}
