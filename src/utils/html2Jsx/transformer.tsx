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
import HeadingButton from "@components/BlogPostComponents/HeadinglinkButton";
import ImageWithCaption from "@components/BlogPostComponents/ImageWithCaption";
import ImageUploader from "@components/EditorComponents/ImageUploader";
import React from "react";
import getYoutubeEmbedLink from "../getYoutubeEmbedLink";
import Details from "@components/BlogPostComponents/Details";
import LexicaImage from "@components/BlogPostComponents/LexicaImage";
import { Element, Root, Text } from "hast";
import CodesandboxWithEditor from "@components/BlogPostComponents/CodeSandbox/CodesandboxWithEditor";
import SandboxRouter from "@components/BlogPostComponents/CodeSandbox/SandboxRouters";

let BLOCK_NUMBER = 0;
let SANDBOX_NUMBER = 0;
let footNotes: { id: number; node: any }[] = [];

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
	node: ReturnType<typeof mdToHast>
	// parent?: HtmlNode
): JSX.Element {
	if (node.type === "root") {
		BLOCK_NUMBER = 0;
		SANDBOX_NUMBER = 0;
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
			(summaryNode as HtmlAstElement)?.children || []
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
					blockNumber={BLOCK_NUMBER}
					{...{ start, end }}
				/>
			);
		}
		if (blockLanguage === "sandbox") {
			SANDBOX_NUMBER += 1;
			return (
				<SandboxRouter
					initialConfig={code}
					SANDBOX_NUMBER={SANDBOX_NUMBER}
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

function headingsRenderer(node: HtmlAstElement) {
	const headingChildren = node.children;
	const headingText = extractTextFromChildren(headingChildren);
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

const createHeadingIdFromHeadingText = (headingText: string) => {
	return headingText
		.split(" ")
		.map((w) => w.toLowerCase())
		.join("-");
};

const extractTextFromChildren = (
	children: HtmlAstElement["children"]
): string => {
	const textArray = children.map((c) => {
		if (c.type === "text") return c.value;
		return extractTextFromChildren((c as HtmlAstElement).children);
	});

	return textArray.join("");
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
