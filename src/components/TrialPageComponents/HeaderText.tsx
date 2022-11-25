import React from "react";

function HeaderText() {
	return (
		<div className="self-center mt-20 tracking-wide text-center leading-relaxed w-4/5 text-4xl pb-10 text-white font-semibold">
			Write posts containing{" "}
			<span className="text-amber-400 trial-1 font-bold">Prose</span>,{" "}
			<span className="text-cyan-400 trial-2 font-bold">
				<span className="italic">Executable</span> code snippets
			</span>
			{", "}
			<span className="text-red-400 trial-3 font-bold">
				Free hand drawings
			</span>
			{", "}
			and <span className="text-lime-400 trial-4 font-bold">
				Images
			</span>{" "}
			using simple markdown.
		</div>
	);
}

export default HeaderText;
