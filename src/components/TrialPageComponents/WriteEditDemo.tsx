import React from "react";
import Image from "next/image";

import writeGif from "../../../public/write.gif";

function WriteEditDemo() {
	return (
		<div className="flex items-center transparent">
			<div className="flex gap-2 items-center text-3xl tracking-wide font-bold text-white mx-auto h-fit ">
				<span>
					<span className="text-amber-400">Write/Edit Posts</span> &{" "}
					<span className="text-cyan-400">Execute code!</span>
				</span>
			</div>
			<div className="flex w-fit border-black border-2 rounded-md mr-4">
				<Image
					src={writeGif.src}
					width={596}
					height={344}
					layout="fixed"
				/>
			</div>
		</div>
	);
}

export default WriteEditDemo;
