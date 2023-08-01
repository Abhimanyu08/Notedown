"use client";
import { memo, useEffect, useState } from "react";
import { BiCheck } from "react-icons/bi";
import { MdContentCopy } from "react-icons/md";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import theme from "react-syntax-highlighter/dist/esm/styles/hljs/an-old-hope";

function CodeWithoutLanguage({
	code,
	language,
}: {
	code: string;
	language?: string;
}) {
	const [copied, setCopied] = useState(false);
	const [importedLanguage, setImportedLanguage] = useState("");
	// const [Highlighter, setHighlighter] = useState(SyntaxHighlighter);

	useEffect(() => {
		if (copied) {
			setTimeout(() => setCopied(false), 2000);
		}
	}, [copied]);

	useEffect(() => {
		if (language) {
			language = language.toLowerCase();
			if (Object.keys(languageToImporter).includes(language)) {
				languageToImporter[
					language as keyof typeof languageToImporter
				]().then(() => {
					setImportedLanguage(language!);
				});
			}
		}
	}, [language]);

	return (
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
				className="absolute top-2 right-2 p-1 rounded-md bg-black/70 opacity-0 group-hover:opacity-100"
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
				style={theme}
				customStyle={{
					paddingLeft: "8px",
					fontSize: "16px",
				}}
				showLineNumbers={true}
				lineNumberStyle={{
					color: "rgb(148 163 184)",
				}}
			>
				{code.trim()}
			</SyntaxHighlighter>
		</div>
	);
}

const languageToImporter = {
	sql: loadSql,
	python: loadPython,
	javascript: loadJavascript,
	rust: loadRust,
	typescript: loadTypeScript,
	css: loadCSS,
	markdown: loadMarkdown,
	go: loadGo,
	c: loadC,
	bash: loadBash,
	shell: loadShell,
};

async function loadSql() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/sql"
	);
	SyntaxHighlighter.registerLanguage("sql", lang.default);
}

async function loadPython() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/python"
	);
	SyntaxHighlighter.registerLanguage("python", lang.default);
}
async function loadRust() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/rust"
	);
	SyntaxHighlighter.registerLanguage("rust", lang.default);
}
async function loadJavascript() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/javascript"
	);
	SyntaxHighlighter.registerLanguage("javascript", lang.default);
}
async function loadTypeScript() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/typescript"
	);
	SyntaxHighlighter.registerLanguage("typescript", lang.default);
}
async function loadCSS() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/css"
	);
	SyntaxHighlighter.registerLanguage("css", lang.default);
}
async function loadC() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/c"
	);
	SyntaxHighlighter.registerLanguage("c", lang.default);
}
async function loadGo() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/go"
	);
	SyntaxHighlighter.registerLanguage("go", lang.default);
}
async function loadMarkdown() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/markdown"
	);
	SyntaxHighlighter.registerLanguage("markdown", lang.default);
}
async function loadBash() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/bash"
	);
	SyntaxHighlighter.registerLanguage("bash", lang.default);
}
async function loadShell() {
	const lang = await import(
		"react-syntax-highlighter/dist/esm/languages/hljs/shell"
	);
	SyntaxHighlighter.registerLanguage("shell", lang.default);
}

export default memo(CodeWithoutLanguage);
