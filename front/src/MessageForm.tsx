import { useState } from "react"
import { ReactComponent as SendIcon } from "./icons/send.svg"
import { API_BASE } from "."
import "./MessageForm.css"

const submitMessage = async (
	recipient: string,
	content: string
): Promise<void> => {
	await fetch(API_BASE + "/new", {
		method: "POST",
		body: JSON.stringify({ recipient, content }),
	})
		.then(console.debug)
		.catch(console.error)
}

export const MessageForm = () => {
	const [recipient, setRecipient] = useState("")
	const [content, setContent] = useState("")

	return (
		<>
			<header>
				<h1 className="decorative">
					Złóż życzenie uczniom i nauczycielom!
				</h1>
			</header>

			<div className="message-form">
				<input
					type="text"
					name="recipient"
					id="recipient"
					className="recipient-input"
					title="Adresat"
					placeholder="Adresat"
					value={recipient}
					onInput={(ev) => {
						setRecipient(ev.currentTarget.value)
					}}
				/>

				<textarea
					className="content-input"
					title="Wiadomość"
					placeholder="Wiadomość"
					value={content}
					onInput={(ev) => {
						setContent(ev.currentTarget.value)
					}}
				></textarea>

				<button
					className="iconbutton-large submit"
					onClick={() => {
						submitMessage(recipient, content)
						setRecipient("")
						setContent(
							"Twoja wiadomość została przyjęta do moderacji."
						)
					}}
				>
					<SendIcon className="iconbuttonimg-large svgicon-large" />
				</button>
			</div>
		</>
	)
}
