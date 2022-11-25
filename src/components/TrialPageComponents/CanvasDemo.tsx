import React from "react";
import Image from "next/image";

import canvasGif from "../../../public/canvas.gif";

function CanvasDemo() {
	return (
		<div className="flex items-center transparent">
			<div className="flex w-fit border-black border-2 rounded-md ml-4">
				<Image
					src={canvasGif.src}
					width={604}
					height={396}
					layout="fixed"
				/>
			</div>
			<div className="flex gap-2 items-center text-3xl tracking-wide font-bold text-white mx-auto h-fit">
				<span>
					Draw{" "}
					<span className="text-red-400">Free Hand Diagrams! </span>
				</span>
			</div>
		</div>
	);
}

export default CanvasDemo;
