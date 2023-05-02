import React from "react";
import { HtmlNode, TextNode } from "./parser";

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
				if (tagToTransformer[child.tagName]) {
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
		node: HtmlNode | TextNode
	) => JSX.Element;
};

const tagToTransformer: TagToTransformer = {};
