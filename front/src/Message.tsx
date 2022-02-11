import { useState } from "react"
import { ReactComponent as HeartIcon } from "./icons/heart.svg"
import { ReactComponent as ReportIcon } from "./icons/report.svg"
import { ID } from "./index"
import "./Message.css"

export const Message = (props: MessageInfo & MessageCallbacks) => {
	const [heartable, setHeartable] = useState(true)
	const [reportable, setReportable] = useState(true)

	return (
		<div className="message">
			<b className="recipient" title={props.recipient}>
				{props.recipient}
			</b>
			<span className="hearts">{props.hearts}</span>

			<button
				className="iconbutton heart"
				disabled={!heartable}
				onClick={() => {
					setHeartable(false)
					props.heartCallback(props.id)
				}}
			>
				<HeartIcon className="iconbuttonimg svgicon" />
			</button>

			<button
				className="iconbutton report"
				disabled={!reportable}
				title={props.id}
				onClick={() => {
					navigator.clipboard.writeText(props.id)
					setReportable(false)
					props.reportCallback(props.id)
				}}
			>
				<ReportIcon className="iconbuttonimg svgicon" />
			</button>

			<p className="content">{props.content}</p>
		</div>
	)
}

export interface MessageInfo {
	id: ID
	hearts?: number
	recipient: string
	content: string
}

export interface MessageCallbacks {
	heartCallback: (id: ID) => unknown
	reportCallback: (id: ID) => unknown
}
