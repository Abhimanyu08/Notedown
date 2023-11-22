"use client";
import React from "react";
import Latex from "react-latex";

function MinimalLatex({ code }: { code: string }) {
	return <Latex>{code}</Latex>;
}

export default MinimalLatex;
