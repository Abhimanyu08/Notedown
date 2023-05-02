import React from "react";
import { HtmlNode, TextNode } from "./parser";
import Latex from "react-latex";

export default function transformer(node: HtmlNode | TextNode): JSX.Element {
	if (node.tagName === "text") {
		return <>{(node as TextNode).text}</>;
	}
	let childrenJsx = transformChildren(node);
	return React.createElement(node.tagName, node.attributes, childrenJsx);
}

function transformChildren(node: HtmlNode): JSX.Element {
	return (
		<>
			{node.children.map((child) => {
				if (
					tagToTransformer[child.tagName] &&
					child.tagName !== "text"
				) {
					return tagToTransformer[child.tagName]!(node, child);
				}
				return transformer(child as HtmlNode);
			})}
		</>
	);
}

type TagToTransformer = {
	[k in keyof HTMLElementTagNameMap | "text"]?: (
		parent: HtmlNode,
		node: HtmlNode
	) => JSX.Element;
};

type HeadTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const tagToTransformer: TagToTransformer = {
	...(() => {
		let headingToRenderers: Partial<
			Record<HeadTags, TagToTransformer["h1"]>
		> = {};
		for (let heading of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
			headingToRenderers[heading as HeadTags] = (_, node) =>
				headingsRenderer(
					heading as HeadTags,
					(node.children[0] as TextNode).text
				);
		}
		return headingToRenderers;
	})(),

	code: (_, node) => {
		let code = (node.children[0] as TextNode).text;
		if (code.startsWith("$") && code.endsWith("$")) {
			return <Latex>{code}</Latex>;
		}
		return <code>{code}</code>;
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
