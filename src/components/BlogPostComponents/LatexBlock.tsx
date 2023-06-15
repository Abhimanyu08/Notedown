"use client";
import Latex from "react-latex";

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
	return <code>{modifiedCode}</code>;
}

export default CodeWord;
