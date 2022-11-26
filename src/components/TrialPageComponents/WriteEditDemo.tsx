import React from "react";
import Image from "next/image";

import writeGif from "../../../public/write.gif";
import DemoContainer from "./DemoContainer";

function WriteEditDemo() {
	return (
		<DemoContainer>
			<div className="flex gap-2 items-center text-3xl tracking-wide font-bold text-white  h-fit ">
				<span>
					<span className="text-amber-400">Write/Edit Posts</span> &{" "}
					<span className="text-cyan-400">Execute code!</span>
				</span>
			</div>
			<div className="flex w-fit border-cyan-400 border-2  drop-shadow-cyan rounded-md mr-4">
				<Image
					src={writeGif.src}
					width={596}
					height={344}
					layout="fixed"
				/>
			</div>
		</DemoContainer>
	);
}

export default WriteEditDemo;
