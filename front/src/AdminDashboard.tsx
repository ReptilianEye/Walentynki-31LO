import { useState, useEffect } from "react"
import { Message, MessageInfo } from "./Message"
import { API_BASE } from "."
import "./AdminDashboard.css"

export const AdminDashboard = (props: {}) => {
	const [token, setToken] = useState("")
	const [modMessage, setModMessage] = useState("")
	const [modMessageInfo, setModMessageInfo] = useState(
		null as MessageInfo | null
	)
	const [modUser, setModUser] = useState("")
	const [modToken, setModToken] = useState("")
	const [reportedMessages, setReportedMessages] = useState(
		[] as MessageInfo[]
	)

	const getReportedMessages = () => {
		fetch(API_BASE + "/admin/messages", {
			method: "POST",
			body: JSON.stringify({ token }),
		})
			.then((res) => res.json())
			.then((msgs) => {
				setReportedMessages(msgs)
				return Promise.resolve(msgs)
			})
			.then(console.debug)
			.catch(console.error)
	}

	useEffect(getReportedMessages, [token])

	return (
		<div className="dashboard">
			<section>
				<label>
					<h2>Set your API token:</h2>
					<input
						type="text"
						name="token"
						id="token"
						value={token}
						onInput={(ev) => {
							setToken(ev.currentTarget.value)
						}}
					/>
				</label>
			</section>

			{token ? (
				<>
					<section>
						<h2>Messages flagged for moderation:</h2>
						<button onClick={getReportedMessages}>Refresh</button>
						{reportedMessages.map?.((msg) => (
							<Message
								key={msg.id}
								heartCallback={(id) => {
									fetch(API_BASE + "/admin/approve", {
										method: "POST",
										body: JSON.stringify({ id, token }),
									})
										.then(console.debug)
										.catch(console.error)
								}}
								reportCallback={(id) => {
									fetch(API_BASE + "/admin/remove", {
										method: "POST",
										body: JSON.stringify({ id, token }),
									})
										.then(console.debug)
										.catch(console.error)
								}}
								{...msg}
							/>
						))}
					</section>

					<section>
						<h2>Moderate a message:</h2>
						<input
							type="text"
							name="message-id"
							id="message-id"
							value={modMessage}
							onInput={(ev) =>
								setModMessage(ev.currentTarget.value)
							}
						/>
						<button
							onClick={() => {
								fetch(API_BASE + "/messages/" + modMessage, {
									method: "GET",
								})
									.then((res) => res.json())
									.then((res) => setModMessageInfo(res))
									.then(console.debug)
									.catch(console.error)
							}}
						>
							Get
						</button>
						<button
							onClick={() => {
								fetch(API_BASE + "/admin/remove", {
									method: "POST",
									body: JSON.stringify({
										id: modMessage,
										token,
									}),
								})
									.then(console.debug)
									.catch(console.error)
							}}
						>
							Delete
						</button>
						<button
							onClick={() => {
								fetch(API_BASE + "/admin/privatise", {
									method: "POST",
									body: JSON.stringify({
										id: modMessage,
										token,
									}),
								})
									.then(console.debug)
									.catch(console.error)
							}}
						>
							Make private
						</button>
						{modMessageInfo ? (
							<Message
								{...modMessageInfo}
								heartCallback={() => {}}
								reportCallback={() => {}}
							/>
						) : (
							<></>
						)}
					</section>

					<section>
						<label>
							<h2>
								Generate a new moderator token (admin only):
							</h2>
							<input
								type="text"
								name="user"
								id="user"
								value={modUser}
								onInput={(ev) => {
									setModUser(ev.currentTarget.value)
								}}
							/>
						</label>
						<button
							onClick={() => {
								fetch(API_BASE + "/admin/createMod", {
									method: "POST",
									body: JSON.stringify({
										user: modUser,
										token,
									}),
									headers: {
										"Content-Type": "application/json",
									},
								})
									.then((res) => res.json())
									.then((res) => setModToken(res.token))
									.catch(console.error)
							}}
						>
							Create
						</button>
						<code>{modToken}</code>
					</section>
				</>
			) : (
				<></>
			)}
		</div>
	)
}
