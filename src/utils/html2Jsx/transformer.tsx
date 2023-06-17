import Carousel from "@components/BlogPostComponents/Carousel";
import Code from "@components/BlogPostComponents/Code";
import CodeWithoutLanguage from "@components/BlogPostComponents/CodeWithoutLanguage";
import Codesandbox from "@components/BlogPostComponents/Codesandbox";
import DrawingOrImage from "@components/BlogPostComponents/DrawingOrImage";
import HeadinglinkButton from "@components/BlogPostComponents/HeadinglinkButton";
import ImageWithCaption from "@components/BlogPostComponents/ImageWithCaption";
import CodeWord from "@components/BlogPostComponents/LatexBlock";
import LexicaImage from "@components/BlogPostComponents/LexicaImage";
import React, { Suspense } from "react";
import getYoutubeEmbedLink from "../getYoutubeEmbedLink";
import { HtmlNode, TextNode } from "./parser";

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
				<div id="footer-section">
					{footNotes
						.sort((a, b) => (a.id < b.id ? -1 : 1))
						.map((footNote) => {
							return (
								<li className="flex gap-2 " key={footNote.id}>
									<span className="not-prose hover:underline text-gray-100 hover:text-white">
										<a
											href={`#footnote-referrer-${footNote.id}`}
											className=""
										>
											{footNote.id}.
										</a>
									</span>
									{transformer(footNote.node)}
								</li>
							);
						})}
				</div>
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

	code: (node) => {
		let code = (node.children[0] as TextNode).text;
		return <CodeWord code={code} />;
	},

	br: () => {
		return <br />;
	},

	pre: (node) => {
		//node = {tagName: "pre", attributes?: {language: 'sql'}, children: [{tagName: "code", chidlren: [{"tagName": "text", text: code}]}]}

		let code =
			((node.children[0] as HtmlNode).children[0] as TextNode)?.text ||
			"";
		if (typeof window !== "undefined") {
			let tempElement = document.createElement("div");
			tempElement.innerHTML = code;
			code = tempElement.innerText || tempElement.textContent || "";
		}

		const { language: blockLanguage } = node.attributes as {
			language?: string;
		};

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
		if (blockLanguage.toLowerCase() === "sandpack") {
			try {
				const settings = JSON.parse(code);
				return <Codesandbox settingsString={code} />;
			} catch (e) {
				alert((e as Error).message);
				return <p>Invalid JSON in your settings. </p>;
			}
		}
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
					className="not-prose text-gray-100 pl-[3px]  hover:underline hover:text-white"
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
		let firstWord = "";
		if (node.children.length == 0) return <></>;
		if (node.children[0].tagName === "text") {
			firstWord = node.children[0].text;
		}
		if (node.children.length === 1 && /^canvas-\d+$/.test(firstWord)) {
			return (
				<Suspense fallback={<p>Loading...</p>}>
					<DrawingOrImage
						// imageFolder={blogMeta.imageFolder}
						canvasImageName={firstWord}
					/>
				</Suspense>
			);
		}
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
			const captions = alt.split(";");

			return (
				<Carousel
					imageNames={src.split(",")}
					captions={captions}
					key={src}
				/>
			);
		}

		if (src) {
			return <ImageWithCaption name={src} alt={alt} key={src} />;
		}
		if (alt && !src) {
			return <LexicaImage alt={alt} />;
		}
		return <p>Invalid Image Elem</p>;
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
