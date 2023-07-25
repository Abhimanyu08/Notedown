import { raw } from "hast-util-raw";
import { defaultSchema, sanitize } from "hast-util-sanitize";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { visit } from "unist-util-visit";
import Carousel from "@components/BlogPostComponents/Carousel";
import Code from "@components/BlogPostComponents/Code";
import CodeWithoutLanguage from "@components/BlogPostComponents/CodeWithoutLanguage";
import CodeWord from "@components/BlogPostComponents/CodeWord";
import Footers from "@components/BlogPostComponents/Footers";
import HeadinglinkButton from "@components/BlogPostComponents/HeadinglinkButton";
import ImageWithCaption from "@components/BlogPostComponents/ImageWithCaption";
import ImageUploader from "@components/EditorComponents/ImageUploader";
import React from "react";
import getYoutubeEmbedLink from "../getYoutubeEmbedLink";
import Details from "@components/BlogPostComponents/Details";
import LexicaImage from "@components/BlogPostComponents/LexicaImage";
import { Element, Root, Text } from "hast";

let BLOCK_NUMBER = 0;
let footNotes: { id: number; node: any }[] = [];

// type TextNode = {
//     type: "text",
//     value: string
// }

// type ElementNode = {
//     type: "element"
//     tagName: keyof HTMLElementTagNameMap,
//     properties: Record<string,string>
//     children: (TextNode|HtmlNode)[]
// }

// type RootNode = {
//     type: "root",
//     children: (TextNode|HtmlNode)[]
// }

// type NormalNode = TextNode |  ElementNode
// type HtmlNode = TextNode | ElementNode | RootNode

const attributes: (typeof defaultSchema)["attributes"] = {
	"*": ["className", "dataStartoffset", "dataEndoffset"],
	img: ["alt", "src"],
	a: ["href"],
};

export function mdToHast(markdown: string) {
	const mdast = fromMarkdown(markdown);
	visit(mdast, (node) => {
		node.data = node.data || {};
		node.data.hProperties = {
			datastartoffset: node.position?.start.offset,
			dataendoffset: node.position?.end.offset,
		};
	});
	const hast = raw(toHast(mdast, { allowDangerousHtml: true })!);
	const safeHast = sanitize(hast, { attributes });
	return safeHast;
	// return hast;
}

type HtmlTagName = keyof HTMLElementTagNameMap;
interface HtmlElement extends Element {
	tagName: HtmlTagName;
}

function defaultTagToJsx(node: HtmlElement) {
	return React.createElement(
		node.tagName,
		node.properties,
		node.children.map((child) => newTransformer(child))
	);
}

export function newTransformer(
	node: ReturnType<typeof mdToHast>
	// parent?: HtmlNode
): JSX.Element {
	if (node.type === "root") {
		BLOCK_NUMBER = 0;
		footNotes = [];
		return (
			<main>
				{node.children.map((child) => newTransformer(child))}

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
				node as HtmlElement
			);
		}
		return defaultTagToJsx(node as HtmlElement);
	}

	return <></>;
}

type TagToTransformer = {
	[k in keyof HTMLElementTagNameMap]?: (node: HtmlElement) => JSX.Element;
};

type HeadTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const tagToTransformer: TagToTransformer = {
	...(() => {
		let headingToRenderers: Partial<
			Record<HeadTags, TagToTransformer["h1"]>
		> = {};
		for (let heading of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
			headingToRenderers[heading as HeadTags] = (node) =>
				headingsRenderer(heading as HeadTags, node.children);
		}
		return headingToRenderers;
	})(),

	details: (node) => {
		let detailsText = "";

		node.children?.forEach((c) => {
			if (c.type === "text") detailsText += c.value;
		});
		detailsText = detailsText.trim();

		let summaryNode = node.children.find(
			(c) => c.type === "element" && c.tagName === "summary"
		);
		let summaryText = extractTextFromChildren(
			(summaryNode as HtmlElement)?.children || []
		).trim();

		return <Details detailsText={detailsText} summaryText={summaryText} />;
	},

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
		//node = {tagName: "pre", attributes?: {language: 'sql'}, children: [{tagName: "code", chidlren: [{"tagName": "text", text: code}]}]}

		let codeNode = node.children[0] as HtmlElement;
		let code = (codeNode.children[0] as Text)?.value || "";
		code = code.trim();
		if (typeof window !== "undefined") {
			let tempElement = document.createElement("div");
			tempElement.innerHTML = code;
			code = tempElement.innerText || tempElement.textContent || "";
		}

		const className = codeNode.properties?.className;
		const blockLanguage =
			className &&
			/language-(.*)/.exec((className as string[])[0])?.at(1);

		const { start, end } = getStartEndFromNode(codeNode);
		if (!blockLanguage) {
			BLOCK_NUMBER += 1;
			return (
				<Code
					key={BLOCK_NUMBER}
					code={code}
					blockNumber={BLOCK_NUMBER}
					{...{ start, end }}
				/>
			);
		}

		// if (blockLanguage === "details") {
		// 	console.log(node);
		// }

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

			const newPNode: HtmlElement = {
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
		if ((child as HtmlElement)?.tagName === "img") {
			imgNode = child;
		}
		let nodesAfterImage = node.children.slice(i + 1);

		let beforeNode: HtmlElement = {
			type: "element",
			tagName: "p",
			children: nodesBeforeImage,
			properties: node.properties,
		};
		let afterNode: HtmlElement = {
			type: "element",
			tagName: "p",
			children: nodesAfterImage,
			properties: node.properties,
		};
		if (imgNode !== undefined) {
			return (
				<>
					{newTransformer(beforeNode)}
					{newTransformer(imgNode)}
					{nodesAfterImage.length > 0 && newTransformer(afterNode)}
				</>
			);
		}

		return defaultTagToJsx(beforeNode);
	},

	img: (node) => {
		const { alt, src } = node.properties as { alt: string; src: string };

		if (src.split(",").length > 1) {
			return (
				<Carousel
					imageNamesString={src}
					captionString={alt}
					key={src}
				/>
			);
		}

		if (src) {
			return <ImageWithCaption name={src} alt={alt} key={src} />;
		}
		let { end } = getStartEndFromNode(node);
		if (alt && !src) {
			return <LexicaImage alt={alt} key={alt} end={end} />;
		}
		return <ImageUploader {...{ end }} />;
	},
};

function headingsRenderer(
	tag: HeadTags,
	headingChildren: HtmlElement["children"]
) {
	const headingText = extractTextFromChildren(headingChildren);
	const headingId = createHeadingIdFromHeadingText(headingText);
	return React.createElement(
		tag,
		{
			id: headingId,
			className: "not-prose group",
		},
		<>
			<a
				href={`#${headingId}`}
				className="hover:underline underline-offset-2"
			>
				{headingChildren.map((child) => newTransformer(child))}
			</a>
			<HeadinglinkButton headingId={headingId} />
		</>
	);
}

const createHeadingIdFromHeadingText = (headingText: string) => {
	return headingText
		.split(" ")
		.map((w) => w.toLowerCase())
		.join("-");
};

const extractTextFromChildren = (children: HtmlElement["children"]): string => {
	const textArray = children.map((c) => {
		if (c.type === "text") return c.value;
		return extractTextFromChildren((c as HtmlElement).children);
	});

	return textArray.join("");
};

function getStartEndFromNode(node: HtmlElement) {
	let start, end;
	if (node.properties) {
		const properties = node.properties;
		start = properties.dataStartoffset
			? parseInt(properties.dataStartoffset as string)
			: undefined;
		end = properties.dataEndoffset
			? parseInt(properties.dataEndoffset as string)
			: undefined;
	}
	return { start, end };
}
