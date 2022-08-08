import React, { useContext, useEffect, useState } from "react";
import { PostContext } from "../pages/posts/[title]";
import { BsPlayFill } from "react-icons/bs";
import { GrRevert } from "react-icons/gr";

interface CodeProps {
	text: string;
	language: string;
	containerId: string;
	blockNumber: number;
	runTillThisPoint: ((blockNumber: number) => void) | null;
}

function Code({
	text,
	language,
	containerId,
	blockNumber,
	runTillThisPoint,
}: CodeProps) {
	const [code, setCode] = useState(text);
	const blockToOutput = useContext(PostContext);
	// // const [changed, setChanged] = useState(false);
	// const [previousCode, setPreviousCode] = useState("");
	// const [output, setOutput] = useState("");

	// const onRun: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
	// 	e.preventDefault();
	// 	const reqBody = {
	// 		language,
	// 		containerId,
	// 		code,
	// 	};
	// 	let resp;
	// 	if (changed && previousCode !== "") {
	// 		resp = await sendRequest("PUT", "http://localhost:5000", {
	// 			...reqBody,
	// 			previousCode,
	// 		});
	// 	} else {
	// 		resp = await sendRequest("POST", "http://localhost:5000", reqBody);
	// 	}
	// 	setPreviousCode(code);
	// 	if (resp.status === 500) {
	// 		setOutput(resp.statusText);
	// 		return;
	// 	}
	// 	const body: { output: string } = await resp.json();
	// 	setOutput(body.output);
	// };

	const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
		e.preventDefault();
		setCode(e.target.value);
		// setChanged(true);
	};

	const onBackToOriginal: React.MouseEventHandler<HTMLButtonElement> = (
		e
	) => {
		e.preventDefault();
		setCode(text);
	};
	return (
		<div className="flex flex-col w-fit">
			<div className="grid grid-cols-4">
				<textarea
					onChange={onChange}
					value={code}
					id={blockNumber.toString()}
					className="bg-black text-yellow-200 col-span-3"
				/>
				<div className="flex flex-col h-full">
					<button
						onClick={() => {
							if (runTillThisPoint) runTillThisPoint(blockNumber);
						}}
						className="border-black h-1/2"
					>
						<BsPlayFill className="text-blue-500" />
					</button>
					<button onClick={onBackToOriginal} className="h-1/2">
						<GrRevert />
					</button>
				</div>
			</div>
			<div className=" text-neutral-900">
				{blockToOutput[blockNumber]}
			</div>
		</div>
	);
}

export default Code;
