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
import { HtmlNode, TextNode } from "./parser";
import Details from "@components/BlogPostComponents/Details";

let BLOCK_NUMBER = 0;
let footNotes: { id: number; node: HtmlNode }[] = [];

function defaultTagToJsx(node: HtmlNode, parent?: HtmlNode) {
	return React.createElement(
		node.tagName,
		node.attributes,
		node.children.map((child) => transformer(child))
	);
}

export default function transformer(
	node: HtmlNode | TextNode,
	parent?: HtmlNode
): JSX.Element {
	if (node.tagName === "text") {
		return <>{(node as TextNode).text}</>;
	}
	if (tagToTransformer[node.tagName]) {
		return tagToTransformer[node.tagName]!(node, parent);
	}
	if (node.tagName === "main") {
		BLOCK_NUMBER = 0;
		footNotes = [];
	}
	return (
		<>
			{defaultTagToJsx(node, parent)}
			{node.tagName === "main" && footNotes.length > 0 && (
				<Footers footNotes={footNotes} />
			)}
		</>
	);
}

type TagToTransformer = {
	[k in keyof HTMLElementTagNameMap]?: (
		node: HtmlNode,
		parent?: HtmlNode
	) => JSX.Element;
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
			if (c.tagName === "text") detailsText += c.text;
		});
		detailsText = detailsText.trim();

		let summaryNode = node.children.find((c) => c.tagName === "summary");
		let summaryText = extractTextFromChildren(
			(summaryNode as HtmlNode)?.children || []
		).trim();

		return <Details detailsText={detailsText} summaryText={summaryText} />;
	},

	code: (node) => {
		let code = (node.children[0] as TextNode)?.text;
		if (!code) return <code></code>;
		return <CodeWord code={code} key={code} />;
	},

	br: () => {
		return <br />;
	},
	hr: () => {
		return <hr />;
	},
	pre: (node) => {
		//node = {tagName: "pre", attributes?: {language: 'sql'}, children: [{tagName: "code", chidlren: [{"tagName": "text", text: code}]}]}

		let codeNode = node.children[0] as HtmlNode;
		let code = (codeNode.children[0] as TextNode)?.text || "";
		code = code.trim();
		if (typeof window !== "undefined") {
			let tempElement = document.createElement("div");
			tempElement.innerHTML = code;
			code = tempElement.innerText || tempElement.textContent || "";
		}

		const { class: className } = codeNode.attributes as {
			class: string;
		};
		const blockLanguage = /language-(.*)/.exec(className)?.at(1);

		if (!blockLanguage) {
			BLOCK_NUMBER += 1;
			return (
				<Code
					key={BLOCK_NUMBER}
					code={code}
					blockNumber={BLOCK_NUMBER}
				/>
			);
		}

		// if (blockLanguage === "details") {
		// 	console.log(node);
		// }

		return (
			<CodeWithoutLanguage
				code={code}
				language={blockLanguage}
				key={blockLanguage}
			/>
		);
	},

	a: (node) => {
		const { href } = node.attributes as { href: string };
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
			linkText[0].tagName === "text" &&
			!href &&
			footNoteRegex.test(linkText[0].text)
		) {
			const footNoteId = linkText[0].text.match(footNoteRegex)?.at(1);
			node.attributes["href"] = `#footnote-${footNoteId}`;
			return (
				<sup
					id={`footnote-referrer-${footNoteId}`}
					className=" text-blue-400 pl-[4px]  hover:underline"
				>
					{React.createElement("a", node.attributes, footNoteId)}
				</sup>
			);
		}
		if (!node.attributes.href.startsWith("#")) {
			// newAttributes = { ...node.attributes, target: "_blank" };
			node.attributes["target"] = "_blank";
		}
		return defaultTagToJsx(node);
	},

	p: (node) => {
		// let firstWord = "";
		if (node.children.length == 0) return <></>;

		//we need to handle the case where image tags are under p -> <p> some text before image <img src alt> some text after image</p> because react throws the warning that p tags can't contain divs inside them

		if (
			node.children[0].tagName === "text" &&
			/^\[(\d+)\]:/.test(node.children[0].text)
		) {
			//This is a footnote
			const firstChild = node.children[0].text;
			const footnoteId = firstChild.match(/^\[(\d+)\]/)?.at(1);
			const remainingTextOfFirstChild = firstChild
				.match(/^\[\d+\]:(.*)/)
				?.at(1);

			const newFirstChild: TextNode = {
				tagName: "text",
				text: remainingTextOfFirstChild || "",
			};

			const newPNode: HtmlNode = {
				tagName: "span",
				attributes: {
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
		while (i !== node.children.length && child?.tagName !== "img") {
			nodesBeforeImage.push(child);
			i++;
			child = node.children[i];
		}
		let imgNode = undefined;
		if (child?.tagName === "img") {
			imgNode = child;
		}
		let nodesAfterImage = node.children.slice(i + 1);

		let beforeNode: HtmlNode = {
			tagName: "p",
			children: nodesBeforeImage,
			attributes: node.attributes,
		};
		let afterNode: HtmlNode = {
			tagName: "p",
			children: nodesAfterImage,
			attributes: node.attributes,
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
		const { alt, src } = node.attributes as { alt: string; src: string };

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
		// if (alt && !src) {
		// 	return <LexicaImage alt={alt} />;
		// }
		return <ImageUploader />;
	},
};

function headingsRenderer(
	tag: HeadTags,
	headingChildren: HtmlNode["children"]
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
				{headingChildren.map((child) => transformer(child))}
			</a>
			<HeadinglinkButton headingId={headingId} />
		</>
	);
}

export const createHeadingIdFromHeadingText = (headingText: string) => {
	return headingText
		.split(" ")
		.map((w) => w.toLowerCase())
		.join("-");
};

export const extractTextFromChildren = (
	children: HtmlNode["children"]
): string => {
	const textArray = children.map((c) => {
		if (c.tagName === "text") return c.text;
		return extractTextFromChildren(c.children);
	});

	return textArray.join("");
};
