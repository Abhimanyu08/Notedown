"use client";
import React, { useEffect, useState } from "react";
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
	return <code>{modifiedCode}</code>;
}

export default CodeWord;
