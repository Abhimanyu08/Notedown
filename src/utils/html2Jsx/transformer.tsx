import Carousel from "@components/BlogPostComponents/Carousel";
import Code from "@components/BlogPostComponents/Code";
import CodeWithoutLanguage from "@components/BlogPostComponents/CodeWithoutLanguage";
import DrawingOrImage from "@components/BlogPostComponents/DrawingOrImage";
import ImageWithCaption from "@components/BlogPostComponents/ImageWithCaption";
import CodeWord from "@components/BlogPostComponents/LatexBlock";
import LexicaImage from "@components/BlogPostComponents/LexicaImage";
import React, { Suspense } from "react";
import getYoutubeEmbedLink from "../getYoutubeEmbedLink";
import { HtmlNode, TextNode } from "./parser";
import Codesandbox from "@components/BlogPostComponents/Codesandbox";

let BLOCK_NUMBER = 0;

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
	if (node.tagName === "main") BLOCK_NUMBER = 0;
	return defaultTagToJsx(node, parent);
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
		return <CodeWithoutLanguage code={code} language={blockLanguage} />;
	},

	a: (node) => {
		const { href } = node.attributes as { href: string };

		if (
			node.children.length === 0 &&
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

		let newAttributes = { ...node.attributes };
		if (!node.attributes.href.startsWith("#")) {
			newAttributes = { ...node.attributes, target: "_blank" };
		}
		node.attributes = newAttributes;
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
		//we need to handle the case where image tags are under p -> <p> some text before image <img src alt> some text after image</p>
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
			attributes: {},
		};
		let afterNode: HtmlNode = {
			tagName: "p",
			children: nodesAfterImage,
			attributes: {},
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
	console.log(headingText);
	return React.createElement(
		tag,
		{
			id: headingText
				.split(" ")
				.map((w) => w.toLowerCase())
				.join("-"),
		},
		headingChildren.map((child) => transformer(child))
	);
}

const extractTextFromChildren = (children: HtmlNode["children"]): string => {
	const textArray = children.map((c) => {
		if (c.tagName === "text") return c.text;
		return extractTextFromChildren(c.children);
	});

	return textArray.join(" ");
};
