import React from "react";

function HeaderText() {
	return (
		<div className="self-center  tracking-wide text-center  px-1 lg:w-4/5 text-2xl lg:text-4xl pb-10 dark:text-white text-black font-semibold">
			Read & Write Posts/Notes containing{" "}
			<span className="dark:text-amber-400 text-amber-800 trial-1 font-extrabold">
				Prose
			</span>
			,{" "}
			<span className="dark:text-cyan-400 text-sky-500 trial-2 font-extrabold">
				<span className="italic">Executable</span> code snippets
			</span>
			{", and "}
			<span className="dark:text-rose-500 text-red-600 trial-3 font-extrabold lg:leading-[72px]">
				Free-hand Diagrams
			</span>
		</div>
	);
}

export default HeaderText;
