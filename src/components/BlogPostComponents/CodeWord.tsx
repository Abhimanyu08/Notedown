"use client";
import { Suspense, memo } from "react";
import Latex from "react-latex";
import TldrawingOrSvg from "./DrawingOrImage";
import TLDrawing from "./TLDrawing";

let CANVAS_NUMBER = 0;

function CodeWord({ code }: { code: string }) {
	let modifiedCode = code;
	if (typeof window !== "undefined") {
		let tempElement = document.createElement("div");
		tempElement.innerHTML = modifiedCode;
		modifiedCode = tempElement.innerText || tempElement.textContent || "";
	}
	if (modifiedCode.startsWith("$") && modifiedCode.endsWith("$")) {
		return <Latex>{modifiedCode}</Latex>;
	}
	if (modifiedCode.startsWith("~~") && modifiedCode.endsWith("~~")) {
		return <del>{modifiedCode.slice(2, modifiedCode.length - 2)}</del>;
	}
	// if (/^canvas-\d+$/.test(modifiedCode)) {
	// 	return (
	// 		<Suspense fallback={<p>Loading...</p>}>
	// 			<DrawingOrImage
	// 				// imageFolder={blogMeta.imageFolder}
	// 				canvasImageName={modifiedCode}
	// 			/>
	// 		</Suspense>
	// 	);
	// }
	const drawRegex = /<draw id=(\d+)\/>/;
	if (drawRegex.test(modifiedCode)) {
		CANVAS_NUMBER += 1;
		const drawId = drawRegex.exec(modifiedCode)?.at(1);
		return <TldrawingOrSvg persistanceKey={drawId || ""} />;
	}
	return <code>{modifiedCode}</code>;
}

export default memo(CodeWord);
