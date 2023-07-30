import Carousel from "@components/BlogPostComponents/Carousel";
import Code from "@components/BlogPostComponents/Code";
import CodeWithoutLanguage from "@components/BlogPostComponents/CodeWithoutLanguage";
import CodeWord from "@components/BlogPostComponents/CodeWord";
import Footers from "@components/BlogPostComponents/Footers";
import HeadingButton from "@components/BlogPostComponents/HeadinglinkButton";
import ImageWithCaption from "@components/BlogPostComponents/ImageWithCaption";
import LexicaImage from "@components/BlogPostComponents/LexicaImage";
import ImageUploader from "@components/EditorComponents/ImageUploader";
import { Element, Text } from "hast";
import { raw } from "hast-util-raw";
import { defaultSchema, sanitize } from "hast-util-sanitize";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import React from "react";
import { visit } from "unist-util-visit";
import getYoutubeEmbedLink from "../getYoutubeEmbedLink";

let BLOCK_NUMBER = 0;
let footNotes: { id: number; node: any }[] = [];

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

function defaultTagToJsx(node: HtmlAstElement) {
	return React.createElement(
		node.tagName,
		node.properties,
		node.children.map((child) => transformer(child))
	);
}

export function transformer(
	node: ReturnType<typeof mdToHast>["htmlAST"]
	// parent?: HtmlNode
): JSX.Element {
	if (node.type === "root") {
		BLOCK_NUMBER = 0;
		footNotes = [];
		return (
			<main>
				{node.children.map((child) => transformer(child))}

				{footNotes.length > 0 && <Footers footNotes={footNotes} />}
			</main>
		);
	}
	if (node.type === "text") {
		return <>{node.value}</>;
	}
	if (node.type === "element") {
		if (tagToTransformer[node.tagName as HtmlTagName]) {
			return tagToTransformer[node.tagName as HtmlTagName]!(
				node as HtmlAstElement
			);
		}
		return defaultTagToJsx(node as HtmlAstElement);
	}

	return <></>;
}

type TagToTransformer = {
	[k in keyof HTMLElementTagNameMap]?: (node: HtmlAstElement) => JSX.Element;
};

type HeadTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const tagToTransformer: TagToTransformer = {
	...(() => {
		let headingToRenderers: Partial<
			Record<HeadTags, TagToTransformer["h1"]>
		> = {};
		for (let heading of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
			headingToRenderers[heading as HeadTags] = (node) =>
				headingsRenderer(node);
		}
		return headingToRenderers;
	})(),

	// details: (node) => {
	// 	let detailsText = "";

	// 	node.children?.forEach((c) => {
	// 		if (c.type === "text") detailsText += c.value;
	// 	});
	// 	detailsText = detailsText.trim();

	// 	let summaryNode = node.children.find(
	// 		(c) => c.type === "element" && c.tagName === "summary"
	// 	);
	// 	let summaryText = extractTextFromChildren(
	// 		(summaryNode as HtmlAstElement)?.children || []
	// 	).trim();

	// 	return <Details detailsText={detailsText} summaryText={summaryText} />;
	// },

	code: (node) => {
		const child = node.children[0] as Text;
		// we are constraining the code elements to only contain plain strings.
		let code = child.value;
		if (!code) return <code></code>;
		return <CodeWord code={code} />;
	},

	br: () => {
		return <br />;
	},
	hr: () => {
		return <hr />;
	},
	pre: (node) => {
		let codeNode = node.children[0] as HtmlAstElement;
		let code = (codeNode.children[0] as Text)?.value || "";

		const className = codeNode.properties?.className;
		const blockLanguage =
			className &&
			/language-(.*)/.exec((className as string[])[0])?.at(1);

		const { start, end } = getStartEndFromNode(codeNode);
		if (!blockLanguage) {
			BLOCK_NUMBER += 1;
			return (
				<Code
					code={code}
					key={BLOCK_NUMBER}
					blockNumber={BLOCK_NUMBER}
					{...{ start, end }}
				/>
			);
		}
		return <CodeWithoutLanguage code={code} language={blockLanguage} />;
	},

	a: (node) => {
		const { href } = node.properties as { href: string };
		const linkText = node.children;

		if (
			linkText.length === 0 &&
			(href.startsWith("https://www.youtube.com") ||
				href.startsWith("https://youtu.be"))
		) {
			return (
				<iframe
					className="w-full youtube"
					src={getYoutubeEmbedLink(href)}
					title="YouTube video player"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				></iframe>
			);
		}

		// let newAttributes = { ...node.attributes };

		// node.attributes = newAttributes;

		const footNoteRegex = /\^(\d+)/;
		if (
			linkText.length === 1 &&
			linkText[0].type === "text" &&
			!href &&
			footNoteRegex.test(linkText[0].value)
		) {
			const footNoteId = linkText[0].value.match(footNoteRegex)?.at(1);
			let properties = { href: `#footnote-${footNoteId}` };
			return (
				<sup
					id={`footnote-referrer-${footNoteId}`}
					className=" text-blue-400 pl-[4px]  hover:underline"
				>
					{React.createElement("a", properties, footNoteId)}
				</sup>
			);
		}
		if (!href.startsWith("#")) {
			// newAttributes = { ...node.attributes, target: "_blank" };
			node.properties!["target"] = "_blank";
		}
		return defaultTagToJsx(node);
	},

	p: (node) => {
		// let firstWord = "";
		if (node.children.length == 0) return <></>;

		// a single dot should be treated as <br/> tag.
		if (
			node.children.length === 1 &&
			node.children.at(0)?.type === "text" &&
			(node.children.at(0)! as any).value === "."
		) {
			return <br />;
		}

		//we need to handle the case where image tags are under p -> <p> some text before image <img src alt> some text after image</p> because react throws the warning that p tags can't contain divs inside them
		if (
			node.children[0].type === "text" &&
			/^\[(\d+)\]:/.test(node.children[0].value)
		) {
			//This is a footnote
			const firstChild = node.children[0].value;
			const footnoteId = firstChild.match(/^\[(\d+)\]/)?.at(1);
			const remainingTextOfFirstChild = firstChild
				.match(/^\[\d+\]:(.*)/)
				?.at(1);

			const newFirstChild: Text = {
				type: "text",
				value: remainingTextOfFirstChild || "",
			};

			const newPNode: HtmlAstElement = {
				type: "element",
				tagName: "span",
				properties: {
					id: `footnote-${footnoteId}`,
					className: "footnote-reference",
				},
				children: [newFirstChild, ...node.children.slice(1)],
			};
			footNotes.push({ id: parseInt(footnoteId || "0"), node: newPNode });
			return <></>;
		}

		let nodesBeforeImage = [];
		let i = 0;
		let child = node.children[i];
		while (
			!(
				i == node.children.length ||
				(child.type === "element" && child.tagName === "img")
			)
		) {
			nodesBeforeImage.push(child);
			i++;
			child = node.children[i];
		}
		let imgNode = undefined;
		if ((child as HtmlAstElement)?.tagName === "img") {
			imgNode = child;
		}
		let nodesAfterImage = node.children.slice(i + 1);

		let beforeNode: HtmlAstElement = {
			type: "element",
			tagName: "p",
			children: nodesBeforeImage,
			properties: node.properties,
		};
		let afterNode: HtmlAstElement = {
			type: "element",
			tagName: "p",
			children: nodesAfterImage,
			properties: node.properties,
		};
		if (imgNode !== undefined) {
			return (
				<>
					{transformer(beforeNode)}
					{transformer(imgNode)}
					{nodesAfterImage.length > 0 && transformer(afterNode)}
				</>
			);
		}

		return defaultTagToJsx(beforeNode);
	},

	img: (node) => {
		const { alt, src } = node.properties as { alt: string; src: string };

		let { end } = getStartEndFromNode(node);
		if (src.split(",").length > 1) {
			return (
				<Carousel
					imageNamesString={src}
					captionString={alt}
					key={src}
					end={end}
				/>
			);
		}

		if (src) {
			return (
				<ImageWithCaption name={src} alt={alt} end={end} key={src} />
			);
		}
		if (alt && !src) {
			return <LexicaImage alt={alt} key={alt} end={end} />;
		}
		return <ImageUploader {...{ end }} />;
	},
};

function headingsRenderer(node: HtmlAstElement) {
	const headingChildren = node.children;
	const headingText = extractTextFromChildren(headingChildren as any);
	const headingId = createHeadingIdFromHeadingText(headingText);
	const { start } = getStartEndFromNode(node);
	return React.createElement(
		node.tagName,
		{
			id: headingId,
			className: "group not-prose",
		},

		<HeadingButton headingId={headingId} start={start}>
			{headingChildren.map((child) => transformer(child))}
		</HeadingButton>
	);
}

export const createHeadingIdFromHeadingText = (headingText: string) => {
	return headingText
		.split(" ")
		.map((w) => w.toLowerCase())
		.join("-");
};

const extractTextFromChildren = (
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

function getStartEndFromNode(node: HtmlAstElement) {
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
