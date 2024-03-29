import { useEffect, useState } from "react"
import { Message, MessageInfo } from "./Message"
import { ID, API_BASE } from "."
import "./MessagesDisplay.css"

const report = (id: ID) => {}

const heart = (id: ID) => {}

export const MessagesDisplay = (props: {}) => {
	const [messages, setMessages] = useState([] as MessageInfo[])

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

			{messages.length > 1 ? (
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
			) : (
				<h1 className="decorative loading">Ładowanie walentynek ...</h1>
			)}

			<footer className="footer">
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
				<p>
					Zorganizowane przez{" "}
					<a href="mailto:alicja.lubiczlisowska@lo31.krakow.pl">
						Alicję Lubicz-Lisowską
					</a>
					,{" "}
					<a href="mailto:katarzyna.jachimczak@lo31.krakow">
						Katarzynę Jachimczak
					</a>
					,{" "}
					<a href="mailto:emilia.jachimczak@lo31.krakow.pl">
						Emilię Jachimczak
					</a>{" "}
					i <a href="https://lo31.com">innych</a>.
				</p>
				<p>
					Walentynki przesłane do i przez uczniów i nauczycieli{" "}
					<a href="https://lo31.com/">
						Liceum Ogólnokształcącego nr 31 w Krakowie
					</a>
					.
				</p>
			</footer>
		</>
	)
}
