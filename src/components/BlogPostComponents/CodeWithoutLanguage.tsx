"use client";
import ShowLnSwitch from "@/app/write/components/ShowLnSwitch";
import { Switch } from "@radix-ui/react-switch";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState, lazy } from "react";
import { BiCheck } from "react-icons/bi";
import { MdContentCopy } from "react-icons/md";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import defaultDark from "react-syntax-highlighter/dist/esm/styles/prism/atom-dark";

const LanguageSelector = lazy(
	() => import("@/app/write/components/LanguageCombobox")
);
const ThemeSelector = lazy(
	() => import("@/app/write/components/ThemeCombobox")
);

function importLanguage(language: string) {
	return import(
		`react-syntax-highlighter/dist/esm/languages/prism/${language}`
	);
}

function importTheme(theme: string): Promise<typeof defaultDark> {
	return import(`react-syntax-highlighter/dist/esm/styles/prism/${theme}`);
}

function NonExecutableCodeblock({
	code,
	language,
	theme,
	showLineNumbers = true,
	start,
}: {
	code: string;
	language?: string;
	theme?: string;
	showLineNumbers?: boolean;
	start?: number;
}) {
	const [copied, setCopied] = useState(false);
	const [importedLanguage, setImportedLanguage] = useState("");
	const [importedTheme, setImportedTheme] = useState(defaultDark);
	const pathname = usePathname();
	// const [Highlighter, setHighlighter] = useState(SyntaxHighlighter);

	useEffect(() => {
		if (copied) {
			setTimeout(() => setCopied(false), 2000);
		}
	}, [copied]);

	useEffect(() => {
		if (language) {
			language = language.toLowerCase();
			importLanguage(language)
				.then((val) => {
					// SyntaxHighlighter.registerLanguage(language!, val.default);
					setImportedLanguage(language!);
				})
				.catch((e) => console.log(e));
		}
	}, [language]);

	useEffect(() => {
		if (theme) {
			importTheme(theme).then((val) => {
				setImportedTheme((val as any).default);
			});
		}
	}, [theme]);

	return (
		<>
			<div
				className="not-prose relative group 
			overflow-x-auto
w-full
lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
		"
			>
				<button
					className="absolute top-4 right-4 p-1 rounded-md bg-black/70 opacity-0 group-hover:opacity-100"
					onClick={() => {
						navigator.clipboard
							.writeText(code)
							.then(() => setCopied(true));
					}}
				>
					{" "}
					{copied ? (
						<BiCheck size={20} className="text-gray-100" />
					) : (
						<MdContentCopy size={20} className="text-gray-100" />
					)}
				</button>
				<SyntaxHighlighter
					language={importedLanguage}
					style={importedTheme}
					customStyle={{
						paddingLeft: showLineNumbers ? "8px" : "16px",
						fontSize: "16px",
						width: "fit-content",
						minWidth: "100%",
					}}
					showLineNumbers={showLineNumbers}
				>
					{code.trim()}
				</SyntaxHighlighter>
			</div>
			{pathname?.startsWith("/write") && (
				<div className="flex gap-2 justify-center mt-2 mb-4">
					<LanguageSelector
						start={start}
						language={language || "javascript"}
					/>
					<ThemeSelector
						start={start}
						theme={theme || "coldark-dark"}
					/>
					<ShowLnSwitch {...{ start, showLineNumbers }} />
				</div>
			)}
		</>
	);
}

export default memo(NonExecutableCodeblock);
