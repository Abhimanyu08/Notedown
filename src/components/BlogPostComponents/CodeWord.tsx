"use client";
import { Suspense, memo } from "react";
import Latex from "react-latex";
import DrawingSvg from "./DrawingSvg";
import TLDrawing from "./TLDrawing";
import { usePathname } from "next/navigation";
import { Codesandbox } from "lucide-react";
import CodesandboxWithEditor from "./CodeSandbox/CodesandboxWithEditor";

function CodeWord({ code }: { code: string }) {
	const pathname = usePathname();

	if (code.startsWith("$") && code.endsWith("$")) {
		return <Latex>{code}</Latex>;
	}
	if (code.startsWith("~~") && code.endsWith("~~")) {
		return <del>{code.slice(2, code.length - 2)}</del>;
	}
	const drawRegex = /<draw id=(\d+) caption="(.*?)"( dark=(true|false))?\/>/;
	if (drawRegex.test(code)) {
		const regexArray = drawRegex.exec(code)!;
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

	const sandboxRegex = /<sandbox id=(\d+)\/>/;
	if (sandboxRegex.test(code)) {
		const regexArray = sandboxRegex.exec(code)!;
		const persistanceKey = regexArray.at(1)!;

		return (
			<CodesandboxWithEditor
				persistanceKey={persistanceKey}
				key={persistanceKey}
			/>
		);
	}

	return <code>{code}</code>;
}

export default memo(CodeWord);
