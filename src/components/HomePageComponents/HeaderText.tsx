import React from "react";

function HeaderText() {
	return (
		<div className="self-center  tracking-wide text-center leading-relaxed px-1 lg:w-4/5 text-2xl lg:text-4xl pb-10 text-white font-semibold">
			Read & Write posts containing{" "}
			<span className="text-amber-400 trial-1 font-bold">Prose</span>,{" "}
			<span className="text-cyan-400 trial-2 font-bold">
				<span className="italic">Executable</span> code snippets
			</span>
			{", and "}
			<span className="text-rose-400 trial-3 font-bold">
				Free hand drawings/diagrams
			</span>
		</div>
	);
}

export default HeaderText;
