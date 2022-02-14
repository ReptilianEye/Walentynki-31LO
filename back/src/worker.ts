// Injected by CF Workers
declare const TOKEN_SECRET: string
declare const PUSHOVER_KEY: string
declare const PUSHOVER_USER: string
declare const MESSAGES: KVNamespace

type ID = string

interface MessageInfo {
	id: ID
	hearts?: number
	recipient: string
	content: string
}

interface MessageMetadata {
	isPublic?: boolean
	isReported?: boolean
	isApproved?: boolean
}

const verifyToken = async (
	token: string
): Promise<"none" | "admin" | "moderator"> => {
	// Check if token is in the correct username.role.signature format
	if (!/^[a-z]+\.((ADMIN)|(MODERATOR))+\.[a-zA-Z0-9\\/+=]+$/gu.test(token)) {
		return "none"
	}

	// Split token into its parts
	const [user, role, signature] = token.split(".")

	// Encode token + secret for signature verification
	const encodedWithSecret = new TextEncoder().encode(
		`${user}.${role}.${TOKEN_SECRET}`
	)

	// Verify signature
	const actualSignature = btoa(
		new Uint8Array(
			await crypto.subtle.digest("SHA-512", encodedWithSecret)
		).reduce((data, byte) => data + String.fromCharCode(byte), "")
	)

	if (signature === actualSignature) {
		if (role === "ADMIN") {
			return "admin"
		}

		if (role === "MODERATOR") {
			return "moderator"
		}
	}

	return "none"
}

const createModeratorToken = async (user: string): Promise<string> => {
	const role = "MODERATOR"

	// Encode token + secret for signature
	const encodedWithSecret = new TextEncoder().encode(
		`${user}.${role}.${TOKEN_SECRET}`
	)

	// Create signature
	const signature = btoa(
		new Uint8Array(
			await crypto.subtle.digest("SHA-512", encodedWithSecret)
		).reduce((data, byte) => data + String.fromCharCode(byte), "")
	)

	const token = `${user}.${role}.${signature}`

	// Double-check token
	if ((await verifyToken(token)) !== "moderator") {
		console.error(
			"Created token that turned out to be invalid. THIS IS VERY BAD."
		)
		return ""
	}

	return token
}

const getMessages = async (): Promise<Response> => {
	// Get a list of all message IDs (has a limit of 1000)
	const messageKeys = (
		(await MESSAGES.list()) as KVNamespaceListResult<MessageMetadata>
	).keys

	// Handle the edge case of no messages existing
	if (!messageKeys) {
		console.info("No messages found. This may be indicative of an error.")
		return new Response(JSON.stringify([]), {
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Get all public messages from the database
	const messages = await Promise.all(
		messageKeys
			.filter((k) => k.metadata?.isPublic === true)
			.map(
				async (k) =>
					await MESSAGES.get(k.name, "json").catch((r) => {
						console.error(r)
						return null
					})
			)
	)

	// Respond with an array of messages
	return new Response(JSON.stringify(messages.filter((msg) => !!msg)), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const getReportedMessages = async (
	body: Promise<{ token: string }>
): Promise<Response> => {
	const { token } = await body

	if ((await verifyToken(token)) === "none") {
		return new Response(JSON.stringify({ success: false }), {
			status: 403,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Get a list of all message IDs (has a limit of 1000)
	const messageKeys = (
		(await MESSAGES.list()) as KVNamespaceListResult<MessageMetadata>
	).keys

	// Handle the edge case of no messages existing
	if (!messageKeys) {
		return new Response(JSON.stringify([]), {
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Get all reported or otherwise non-public messages from the database
	const messages = await Promise.all(
		messageKeys
			.filter(
				(k) =>
					k.metadata?.isReported === true ||
					(!k.metadata?.isPublic && !k.metadata?.isApproved)
			)
			.map(
				async (k) =>
					await MESSAGES.get(k.name, "json").catch((r) => {
						console.error(r)
						return null
					})
			)
	)

	// Respond with an array of messages
	return new Response(JSON.stringify(messages.filter((msg) => !!msg)), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const getMessage = async (id: ID): Promise<Response> => {
	// Get current message info
	const message: KVNamespaceGetWithMetadataResult<
		MessageInfo,
		MessageMetadata | null
	> | null = await MESSAGES.getWithMetadata(id, "json")

	// Make sure message exists
	if (!message) {
		return new Response(JSON.stringify({}), {
			status: 404,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Respond with the message info and some metadata
	return new Response(
		JSON.stringify({
			isReported: message.metadata?.isReported,
			isPublic: message.metadata?.isPublic,
			...message.value,
		}),
		{
			headers: { "Access-Control-Allow-Origin": "*" },
		}
	)
}

const createMessage = async (
	body: Promise<{ recipient: string; content: string }>
): Promise<Response> => {
	const { recipient, content } = await body

	// Create the message info object
	const msg: MessageInfo = {
		id: crypto.randomUUID(),
		recipient,
		content,
	}

	// Save message, non-public by default
	await MESSAGES.put(msg.id, JSON.stringify(msg))

	// Send push notification to the moderation team
	await fetch("https://api.pushover.net/1/messages.json", {
		method: "POST",
		body: JSON.stringify({
			token: PUSHOVER_KEY,
			user: PUSHOVER_USER,
			message: `Message with id ${msg.id} was just submitted for review. This is a new message. Message recipient: "${msg.recipient}". Message content: "${msg.content}".`,
			title: "New Message",
			priority: 0,
			url: `https://walentynki.liceum31.workers.dev/messages/${msg.id}`,
			url_title: "Message Info",
		}),
		headers: { "Content-Type": "application/json" },
	})
		.then(() =>
			console.debug(
				`Sent submission notification for message with id ${msg.id}`
			)
		)
		.catch(console.error)

	// Respond with a success message
	return new Response(JSON.stringify({ success: true }), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const reportMessage = async (
	body: Promise<{ id: string; ts: string | number }>
): Promise<Response> => {
	const { id, ts } = await body

	// Get current message info
	const msg: KVNamespaceGetWithMetadataResult<MessageInfo, MessageMetadata> =
		await MESSAGES.getWithMetadata(id, "json")

	// Make sure message exists
	if (!msg || !msg.value) {
		return new Response(JSON.stringify({ success: false, id }), {
			status: 404,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// If the message was approved by a moderator, ignore this report
	if (msg.metadata?.isApproved) {
		return new Response(JSON.stringify({ success: false, id }), {
			status: 409,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	const wasReported = msg.metadata?.isReported || false

	// Save the updated message, setting it private if it was previously reported
	await MESSAGES.put(msg.value.id, JSON.stringify(msg.value), {
		metadata: {
			isReported: true,
			isPublic: !wasReported && msg.metadata?.isPublic,
		},
	})

	// Send push notification to the moderation team
	await fetch("https://api.pushover.net/1/messages.json", {
		method: "POST",
		body: JSON.stringify({
			token: PUSHOVER_KEY,
			user: PUSHOVER_USER,
			message: `Message with id ${id} was just flagged for review. ${
				wasReported
					? "This message was previously reported and has been automatically made private."
					: "This is this message's first report."
			} Original message recipient: "${
				msg.value.recipient
			}". Original message content: "${msg.value.content}".`,
			title: "New Reported Message",
			priority: 1,
			timestamp: ts,
			url: `https://walentynki.liceum31.workers.dev/messages/${id}`,
			url_title: "Message Info",
		}),
		headers: { "Content-Type": "application/json" },
	})
		.then(() =>
			console.debug(`Sent report notification for message with id ${id}`)
		)
		.catch(console.error)

	// Respond with a success message
	return new Response(JSON.stringify({ success: true, id }), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const heartMessage = async (
	body: Promise<{ id: string; ts: string | number }>
): Promise<Response> => {
	const { id } = await body

	// Get current message info
	const message: KVNamespaceGetWithMetadataResult<
		MessageInfo,
		MessageMetadata
	> = await MESSAGES.getWithMetadata(id, "json")

	// Make sure message exists
	if (!message || !message.value) {
		return new Response(JSON.stringify({ success: false, id }), {
			status: 404,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Increment number of hearts
	message.value.hearts = (message.value.hearts || 0) + 1

	// Save updated message and respond with a success message
	await MESSAGES.put(message.value.id, JSON.stringify(message.value), {
		metadata: message.metadata,
	})

	return new Response(JSON.stringify({ success: true, id }), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const makeMod = async (
	body: Promise<{ user: string; token: string }>
): Promise<Response> => {
	const { user, token } = await body

	// Check admin token
	if ((await verifyToken(token)) !== "admin") {
		return new Response(JSON.stringify({ success: false, token: "" }), {
			status: 403,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Check username format
	if (!/^[a-z]+$/gu.test(user)) {
		return new Response(JSON.stringify({ success: false, token: "" }), {
			status: 400,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Generate new moderator token
	const newToken = await createModeratorToken(user)

	return new Response(JSON.stringify({ success: true, token: newToken }), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const removeMessage = async (
	body: Promise<{ id: ID; token: string }>
): Promise<Response> => {
	const { id, token } = await body

	// Check moderator token
	if ((await verifyToken(token)) === "none") {
		return new Response(JSON.stringify({ success: false }), {
			status: 403,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Check if message exists
	const message = await MESSAGES.get(id, "text")

	console.log(`${token.split(".")[0]} is deleting message ${id}.`)

	if (!message) {
		return new Response(JSON.stringify({ success: false, id }), {
			status: 404,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Delete message
	await MESSAGES.delete(id)

	return new Response(JSON.stringify({ success: true }), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const approveMessage = async (
	body: Promise<{ id: ID; token: string }>
): Promise<Response> => {
	const { id, token } = await body

	// Check moderator token
	if ((await verifyToken(token)) === "none") {
		return new Response(JSON.stringify({ success: false }), {
			status: 403,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Get message info
	const msg: KVNamespaceGetWithMetadataResult<MessageInfo, MessageMetadata> =
		await MESSAGES.getWithMetadata(id, "json")

	// Make sure message exists
	if (!msg || !msg.value) {
		return new Response(JSON.stringify({ success: false }), {
			status: 404,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Set message public and approved (unless it was just submitted)
	await MESSAGES.put(msg.value.id, JSON.stringify(msg.value), {
		metadata: {
			isPublic: true,
			isApproved: !!msg.metadata?.isReported,
			isReported: false,
		},
	})

	return new Response(JSON.stringify({ success: true, id: msg.value.id }), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const privatiseMessage = async (
	body: Promise<{ id: ID; token: string }>
): Promise<Response> => {
	const { id, token } = await body

	// Check moderator token
	if ((await verifyToken(token)) === "none") {
		return new Response(JSON.stringify({ success: false }), {
			status: 403,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Get message info
	const msg: KVNamespaceGetWithMetadataResult<MessageInfo, MessageMetadata> =
		await MESSAGES.getWithMetadata(id, "json")

	// Make sure message exists
	if (!msg || !msg.value) {
		return new Response(JSON.stringify({ success: false }), {
			status: 404,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}

	// Set message private and not approved
	await MESSAGES.put(msg.value.id, JSON.stringify(msg.value), {
		metadata: {
			isPublic: false,
			isApproved: false,
			isReported: !!msg.metadata?.isReported,
		},
	})

	return new Response(JSON.stringify({ success: true, id: msg.value.id }), {
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

const sendPreflight = async (): Promise<Response> =>
	new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	})

addEventListener("fetch", (event: FetchEvent) => {
	const req = event.request
	const path = new URL(req.url).pathname

	if (req.method === "GET") {
		if (
			path === "/messages" ||
			path === "/messages/" ||
			path === "/messages.json"
		) {
			// Respond with all public messages
			event.respondWith(getMessages())
		} else if (
			/^\/messages\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/gu.test(
				path
			)
		) {
			// Respond with a specific message
			event.respondWith(getMessage(path.replace("/messages/", "")))
		}
	} else if (req.method === "POST") {
		if (path === "/new") {
			// Submit a new message
			event.respondWith(createMessage(req.json()))
		} else if (path === "/report") {
			// Collect a message report
			//// event.respondWith(reportMessage(req.json()))
		} else if (path === "/heart") {
			// Process a message being hearted
			event.respondWith(heartMessage(req.json()))
		} else if (path === "/admin/messages") {
			// Return all reported messages
			event.respondWith(getReportedMessages(req.json()))
		} else if (path === "/admin/approve") {
			// Approve a message
			event.respondWith(approveMessage(req.json()))
		} else if (path === "/admin/remove") {
			// Delete a message
			event.respondWith(removeMessage(req.json()))
		} else if (path === "/admin/privatise") {
			// Make a message private
			event.respondWith(privatiseMessage(req.json()))
		} else if (path === "/admin/createMod") {
			// Return a new moderator token
			event.respondWith(makeMod(req.json()))
		}
	} else if (req.method === "OPTIONS") {
		// Respond to a CORS preflight request
		event.respondWith(sendPreflight())
	}
})
