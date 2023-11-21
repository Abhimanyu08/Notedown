"use client";
import React, { useState } from "react";
import { BiCheck } from "react-icons/bi";
import { MdContentCopy } from "react-icons/md";

function CopycodeButton({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			className="absolute top-4 right-4 p-1 rounded-md bg-black/70 opacity-0 group-hover:opacity-100"
			onClick={() => {
				navigator.clipboard.writeText(code).then(() => setCopied(true));
			}}
		>
			{" "}
			{copied ? (
				<BiCheck size={20} className="text-gray-100" />
			) : (
				<MdContentCopy size={20} className="text-gray-100" />
			)}
		</button>
	);
}

export default CopycodeButton;
