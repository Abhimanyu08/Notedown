import React from "react";
import { HtmlNode, TextNode } from "./parser";
import Latex from "react-latex";
import Code from "../../src/components/BlogPostComponents/Code";
import { BlogProps } from "../../src/interfaces/BlogProps";
import CodeWithoutLanguage from "../../src/components/BlogPostComponents/CodeWithoutLanguage";

type BlogMeta = Partial<{
	language: BlogProps["language"];
	imageFolder: string;
	imageToUrl: Record<string, string>;
}>;

export default function transformer(
	node: HtmlNode | TextNode,
	blogMeta: BlogMeta
): JSX.Element {
	if (node.tagName === "text") {
		return <>{(node as TextNode).text}</>;
	}
	let childrenJsx = transformChildren(node, blogMeta);
	return React.createElement(node.tagName, node.attributes, childrenJsx);
}

function transformChildren(node: HtmlNode, blogMeta: BlogMeta): JSX.Element {
	return (
		<>
			{node.children.map((child) => {
				if (
					child.tagName !== "text" &&
					tagToTransformer[child.tagName]
				) {
					return tagToTransformer[child.tagName]!(
						child,
						node,
						blogMeta
					);
				}
				return transformer(child, blogMeta);
			})}
		</>
	);
}

type TagToTransformer = {
	[k in keyof HTMLElementTagNameMap]?: (
		node: HtmlNode,
		parent: HtmlNode,
		blogMeta: BlogMeta
	) => JSX.Element;
};

type HeadTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

let BLOCK_NUMBER = -1;

const tagToTransformer: TagToTransformer = {
	...(() => {
		let headingToRenderers: Partial<
			Record<HeadTags, TagToTransformer["h1"]>
		> = {};
		for (let heading of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
			headingToRenderers[heading as HeadTags] = (node) =>
				headingsRenderer(
					heading as HeadTags,
					(node.children[0] as TextNode).text
				);
		}
		return headingToRenderers;
	})(),

	code: (node) => {
		let code = (node.children[0] as TextNode).text;
		let tempElement = document.createElement("div");
		tempElement.innerHTML = code;
		code = tempElement.innerText || tempElement.textContent || "";
		if (code.startsWith("$") && code.endsWith("$")) {
			return <Latex>{code}</Latex>;
		}
		return <code>{code}</code>;
	},

	pre: (node, _, blogMeta) => {
		let code = ((node.children[0] as HtmlNode).children[0] as TextNode)
			.text;
		let tempElement = document.createElement("div");
		tempElement.innerHTML = code;
		code = tempElement.innerText || tempElement.textContent || "";

		const { language: blockLanguage } = node.attributes as {
			language?: string;
		};

		if (blogMeta.language && !blockLanguage) {
			BLOCK_NUMBER += 1;
			return (
				<Code
					key={BLOCK_NUMBER}
					language={blogMeta.language}
					code={code}
					blockNumber={BLOCK_NUMBER}
				/>
			);
		}
		return <CodeWithoutLanguage code={code} language={blockLanguage} />;
	},
};

function headingsRenderer(tag: HeadTags, headingText: string) {
	return React.createElement(
		tag,
		{
			id: headingText
				.split(" ")
				.map((w) => w.toLowerCase())
				.join("-"),
		},
		headingText
	);
}
