import React from "react";
import Image from "next/image";

import canvasGif from "../../../public/canvas.gif";
import DemoContainer from "./DemoContainer";

function CanvasDemo() {
	return (
		<DemoContainer>
			<div className="flex w-fit border-rose-400 border-2 rounded-md mr-20 drop-shadow-red">
				<Image
					src={canvasGif.src}
					width={604}
					height={396}
					layout="fixed"
				/>
			</div>
			<div className="flex gap-2 items-center text-3xl tracking-wide font-bold text-white  h-fit">
				<span>
					Draw{" "}
					<span className="text-rose-400">Free Hand Diagrams! </span>
				</span>
			</div>
		</DemoContainer>
	);
}

export default CanvasDemo;
