"use client";
import { lazy, memo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Latex from "react-latex";

const SandboxRouter = lazy(() => import("./CodeSandbox/SandboxRouters"));
const CodesandboxWithEditor = lazy(
	() => import("./CodeSandbox/CodesandboxWithEditor")
);

const TLDrawing = lazy(() => import("./TLDrawing"));
function CodeWord({ code }: { code: string }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

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
		return (
			<TLDrawing
				persistanceKey={persistanceKey}
				dark={dark !== "false"}
				caption={caption}
				key={persistanceKey}
			/>
		);
	}

	const sandboxRegex = /<sandbox id=(\d+)\/>/;
	if (sandboxRegex.test(code)) {
		const regexArray = sandboxRegex.exec(code)!;
		const persistanceKey = regexArray.at(1)!;
		if (pathname?.startsWith("/write")) {
			return (
				<CodesandboxWithEditor
					persistanceKey={persistanceKey}
					key={persistanceKey}
				/>
			);
		}

		return <SandboxRouter persistanceKey={persistanceKey} />;
	}

	return <code>{code}</code>;
}

export default memo(CodeWord);
