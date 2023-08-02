"use client";
import { lazy, memo } from "react";
import { usePathname } from "next/navigation";

function CodeWord({ code }: { code: string }) {
	const pathname = usePathname();

	if (code.startsWith("$") && code.endsWith("$")) {
		const Latex = lazy(() => import("react-latex"));
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
			const TLDrawing = lazy(() => import("./TLDrawing"));
			return (
				<TLDrawing
					persistanceKey={persistanceKey}
					dark={dark !== "false"}
					caption={caption}
					key={persistanceKey}
				/>
			);
		}
		const DrawingSvg = lazy(() => import("./DrawingSvg"));
		return <DrawingSvg {...{ persistanceKey, caption }} />;
	}

	const sandboxRegex = /<sandbox id=(\d+)\/>/;
	if (sandboxRegex.test(code)) {
		const regexArray = sandboxRegex.exec(code)!;
		const persistanceKey = regexArray.at(1)!;

		const SandboxRouter = lazy(
			() => import("./CodeSandbox/SandboxRouters")
		);
		return <SandboxRouter persistanceKey={persistanceKey} />;
	}

	return <code>{code}</code>;
}

export default memo(CodeWord);
