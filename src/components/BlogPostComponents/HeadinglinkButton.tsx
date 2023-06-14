"use client";
import React from "react";
import { BiLink } from "react-icons/bi";

function HeadinglinkButton({ headingId }: { headingId: string }) {
	return (
		<button
			className="rounded-full tooltip p-1 ml-3 text-white invisible group-hover:visible  hover:scale-105 active:scale-95"
			onClick={() => {
				navigator.clipboard.writeText(`#${headingId}`);
			}}
			data-tip="Copy heading id"
		>
			<BiLink size={18} />
		</button>
	);
}

export default HeadinglinkButton;
