import { Element } from "hast";
import { raw } from "hast-util-raw";
import { defaultSchema, sanitize } from "hast-util-sanitize";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import React from "react";
import { visit } from "unist-util-visit";
import { TagToJsx } from "./TagToJsx";

const attributes: (typeof defaultSchema)["attributes"] = {
	"*": ["className", "dataStartoffset", "dataEndoffset"],
	img: ["alt", "src"],
	a: ["href"],
};
export type HeadingType = {
	depth: number;
	text: string;
	children: HeadingType[];
	parent: HeadingType | null;
};

export function mdToHast(markdown: string) {
	const mdast = fromMarkdown(markdown);
	// const curre
	let rootHeadingItem: HeadingType = {
		depth: 0,
		text: "Table of contents",
		children: [],
		parent: null,
	};
	let currentHeadingItem = rootHeadingItem;
	visit(mdast, (node) => {
		if (node.type === "heading") {
			if (currentHeadingItem.depth < node.depth) {
				// node should be a child of the currentHeadingItem
				let headingNode: HeadingType = {
					depth: node.depth,
					text: extractTextFromChildren(node.children as any),
					children: [],
					parent: currentHeadingItem,
				};

				currentHeadingItem.children.push(headingNode);
				currentHeadingItem = headingNode;
			} else if (currentHeadingItem.depth === node.depth) {
				// current node is sibling of the currentHeadingItem
				let headingNode: HeadingType = {
					depth: node.depth,
					text: extractTextFromChildren(node.children as any),
					children: [],
					parent: currentHeadingItem.parent,
				};
				currentHeadingItem.parent?.children.push(headingNode);

				currentHeadingItem = headingNode;
			} else {
				// currentHeadingItem.depth > node.depth. Therefore node is child of one of it's grandparent

				let parent = currentHeadingItem.parent;
				while (parent?.depth !== node.depth && parent?.depth !== 0) {
					parent = parent!.parent;
				}
				if (parent.depth === node.depth) {
					let headingNode: HeadingType = {
						depth: node.depth,
						text: extractTextFromChildren(node.children as any),
						children: [],
						parent: parent.parent,
					};
					parent.parent?.children.push(headingNode);
					currentHeadingItem = headingNode;
				}
				if (parent.depth === 0) {
					let headingNode: HeadingType = {
						depth: node.depth,
						text: extractTextFromChildren(node.children as any),
						children: [],
						parent: parent,
					};
					parent.children.push(headingNode);
					currentHeadingItem = headingNode;
				}
			}
		}

		node.data = node.data || {};
		node.data.hProperties = {
			datastartoffset: node.position?.start.offset,
			dataendoffset: node.position?.end.offset,
		};
	});
	const hast = raw(toHast(mdast, { allowDangerousHtml: true })!);
	const safeHast = sanitize(hast, { attributes });
	return {
		htmlAST: safeHast,
		headingAST: rootHeadingItem,
	};
	// return hast;
}

type HtmlTagName = keyof HTMLElementTagNameMap;
export interface HtmlAstElement extends Element {
	tagName: HtmlTagName;
}

export function defaultTagToJsx(node: HtmlAstElement, tagToJsxConverter?: any) {
	return React.createElement(
		node.tagName,
		node.properties,
		node.children.map((child) => transformer(child, tagToJsxConverter))
	);
}

export function transformer(
	node: ReturnType<typeof mdToHast>["htmlAST"],
	tagToJsxConverter: TagToJsx
	// parent?: HtmlNode
): JSX.Element {
	if (node.type === "root") {
		tagToJsxConverter.footnotes = [];
		return (
			<main>
				{node.children.map((child) =>
					transformer(child, tagToJsxConverter)
				)}
			</main>
		);
	}
	if (node.type === "text") {
		return <>{node.value}</>;
	}
	if (node.type === "element") {
		if (Object.hasOwn(tagToJsxConverter, node.tagName)) {
			return tagToJsxConverter[node.tagName as HtmlTagName]!(
				node as HtmlAstElement,
				tagToJsxConverter
			);
		}
		return defaultTagToJsx(node as HtmlAstElement, tagToJsxConverter);
	}

	return <></>;
}

export const createHeadingIdFromHeadingText = (headingText: string) => {
	return headingText.split(" ").join("-");
};

export const extractTextFromChildren = (
	children: ReturnType<typeof fromMarkdown>["children"]
): string => {
	const textArray = children?.map((c) => {
		if (c.type === "inlineCode" || c.type === "text") return c.value;
		if (Object.hasOwn(c, "children")) {
			return extractTextFromChildren((c as any).children);
		}
	});

	return (textArray || []).join("");
};

export function getStartEndFromNode(node: HtmlAstElement) {
	let start = 0;
	let end = 0;
	if (node.properties) {
		const properties = node.properties;
		start = properties.dataStartoffset
			? parseInt(properties.dataStartoffset as string)
			: 0;
		end = properties.dataEndoffset
			? parseInt(properties.dataEndoffset as string)
			: 0;
	}
	return { start, end };
}
