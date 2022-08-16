import React, { useContext, useEffect, useState } from "react";
import { BlogContext } from "../pages/posts/[postId]";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage } from "react-icons/md";

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
	const [hideOutput, setHideOutput] = useState(false);
	const blockToOutput = useContext(BlogContext);

	const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
		e.preventDefault();
		setCode(e.target.value);
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
				<button onClick={() => setHideOutput((prev) => !prev)}>
					<MdHideImage />
				</button>
			</div>
			{blockToOutput[blockNumber] && (
				<div
					className={` text-white bg-black p-2 mt-2 rounded-md ${
						hideOutput ? "hidden" : ""
					}`}
				>
					{blockToOutput[blockNumber]}
				</div>
			)}
		</div>
	);
}

export default Code;
