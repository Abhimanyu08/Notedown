import React from "react";
import Image from "next/image";

import writeGif from "../../../public/write.gif";
import writeMobileGif from "../../../public/write-mobile.gif";
import DemoContainer from "./DemoContainer";

function WriteEditDemo() {
	return (
		<DemoContainer>
			<div className="flex gap-0 md:gap-2 flex-col md:flex-row items-center text-2xl lg:text-3xl tracking-wide font-bold text-white  h-fit ">
				<span className="text-amber-400">Write/Edit Posts</span> &{" "}
				<span className="text-cyan-400">Execute code!</span>
			</div>
			<div className="lg:flex hidden w-fit border-cyan-400 border-2  drop-shadow-cyan rounded-md ">
				<Image
					src={writeGif.src}
					width={596}
					height={344}
					layout="fixed"
				/>
			</div>
			<div className="flex lg:hidden w-fit border-cyan-400 border-2  drop-shadow-cyan rounded-md ">
				<Image
					src={writeMobileGif.src}
					width={320}
					height={605}
					layout="fixed"
				/>
			</div>
		</DemoContainer>
	);
}

export default WriteEditDemo;
