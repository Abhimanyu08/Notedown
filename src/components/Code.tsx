import React, { useContext, useEffect, useState } from "react";
import { PostContext } from "../pages/posts/[postId]";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";

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
		<div className="flex relative flex-col w-full my-2">
			<textarea
				onChange={onChange}
				value={code}
				id={blockNumber.toString()}
				className="bg-black w-full text-yellow-200 rounded-md p-2 h-max"
			/>
			<div className="flex flex-row absolute right-2 text-cyan-400 m-1 gap-1">
				<button
					onClick={() => {
						if (runTillThisPoint) runTillThisPoint(blockNumber);
					}}
					className=""
				>
					<BsPlayFill />
				</button>
				<button onClick={onBackToOriginal} className="">
					<FcUndo />
				</button>
			</div>
			{blockToOutput[blockNumber] && (
				<div className=" text-white bg-black p-2 mt-2 rounded-md">
					{blockToOutput[blockNumber]}
				</div>
			)}
		</div>
	);
}

export default Code;
