"use client";
import { Suspense, memo } from "react";
import Latex from "react-latex";
import DrawingOrImage from "./DrawingOrImage";

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
	if (/^canvas-\d+$/.test(modifiedCode)) {
		return (
			<Suspense fallback={<p>Loading...</p>}>
				<DrawingOrImage
					// imageFolder={blogMeta.imageFolder}
					canvasImageName={modifiedCode}
				/>
			</Suspense>
		);
	}
	return <code>{modifiedCode}</code>;
}

export default memo(CodeWord);
