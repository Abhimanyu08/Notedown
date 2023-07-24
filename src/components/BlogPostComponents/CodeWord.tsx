"use client";
import { Suspense, memo } from "react";
import Latex from "react-latex";
import DrawingSvg from "./DrawingSvg";
import TLDrawing from "./TLDrawing";
import { usePathname } from "next/navigation";

let CANVAS_NUMBER = 0;

function CodeWord({ code }: { code: string }) {
	let modifiedCode = code;
	const pathname = usePathname();
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
	const drawRegex = /<draw id=(\d+) caption="(.*?)"( dark=(true|false))?\/>/;
	if (drawRegex.test(modifiedCode)) {
		CANVAS_NUMBER += 1;
		const regexArray = drawRegex.exec(modifiedCode)!;
		const persistanceKey = regexArray.at(1)!;
		const caption = regexArray.at(2) || "";
		const dark = regexArray.at(4);
		if (pathname?.startsWith("/write")) {
			return (
				<TLDrawing
					persistanceKey={persistanceKey}
					dark={dark !== "false"}
					caption={caption}
					key={persistanceKey}
				/>
			);
		}
		return <DrawingSvg {...{ persistanceKey, caption }} />;
	}
	return <code>{modifiedCode}</code>;
}

export default memo(CodeWord);
