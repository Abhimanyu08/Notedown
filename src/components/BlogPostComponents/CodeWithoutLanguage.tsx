"use client";
import { useEffect, useState } from "react";
import { BiCheck } from "react-icons/bi";
import { MdContentCopy } from "react-icons/md";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/cjs/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/cjs/languages/hljs/python";
import rust from "react-syntax-highlighter/dist/cjs/languages/hljs/rust";
import sql from "react-syntax-highlighter/dist/cjs/languages/hljs/sql";
import typescript from "react-syntax-highlighter/dist/cjs/languages/hljs/typescript";
import theme from "react-syntax-highlighter/dist/cjs/styles/hljs/atom-one-dark";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("typescript", typescript);

function CodeWithoutLanguage({
	code,
	language,
}: {
	code: string;
	language?: string;
}) {
	const [_, setImported] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			setTimeout(() => setCopied(false), 2000);
		}
	}, [copied]);

	useEffect(() => {
		if (language) {
			language = language.toLowerCase();
			if (!Object.keys(languageToImporter).includes(language)) {
				alert(`${language} not supported`);
			}
			languageToImporter[language as keyof typeof languageToImporter];

			setImported(true);
		}
	}, [language]);

	return (
		<div className="not-prose relative group">
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
			<SyntaxHighlighter language={language || ""} style={theme}>
				{code}
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
};

async function loadSql() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/sql"
	);
	SyntaxHighlighter.registerLanguage("sql", lang);
}

async function loadPython() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/python"
	);
	SyntaxHighlighter.registerLanguage("python", lang);
}
async function loadRust() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/rust"
	);
	SyntaxHighlighter.registerLanguage("rust", lang);
}
async function loadJavascript() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/javascript"
	);
	SyntaxHighlighter.registerLanguage("javascript", lang);
}
async function loadTypeScript() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/typescript"
	);
	SyntaxHighlighter.registerLanguage("typescript", lang);
}
async function loadCSS() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/css"
	);
	SyntaxHighlighter.registerLanguage("css", lang);
}
async function loadC() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/c"
	);
	SyntaxHighlighter.registerLanguage("c", lang);
}
async function loadGo() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/go"
	);
	SyntaxHighlighter.registerLanguage("go", lang);
}
async function loadMarkdown() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/markdown"
	);
	SyntaxHighlighter.registerLanguage("markdown", lang);
}

export default CodeWithoutLanguage;
