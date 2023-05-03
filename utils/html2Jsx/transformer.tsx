import React from "react";
import { HtmlNode, TextNode } from "./parser";
import Latex from "react-latex";
import Code from "../../src/components/BlogPostComponents/Code";
import { BlogProps } from "../../src/interfaces/BlogProps";
import CodeWithoutLanguage from "../../src/components/BlogPostComponents/CodeWithoutLanguage";
import getYoutubeEmbedLink from "../getYoutubeEmbedLink";
import DrawingOrImage from "../../src/components/BlogPostComponents/DrawingOfImage";

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
		//node = {tagName: "pre", attributes?: {language: 'sql'}, children: [{tagName: "code", chidlren: [{"tagName": "text", text: code}]}]}

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

		let newAttributes = { ...node.attributes, target: "_blank" };
		node.attributes = newAttributes;
		return transformer(node, {});
	},

	p: (node, _, blogMeta) => {
		console.log(node);
		let firstWord = "";
		if (node.children[0].tagName === "text") {
			firstWord = node.children[0].text;
		}
		if (node.children.length === 1 && /^canvas-\d+$/.test(firstWord)) {
			return (
				<DrawingOrImage
					imageFolder={blogMeta.imageFolder}
					canvasImageName={firstWord}
				/>
			);
		}
		return transformer(node, blogMeta);
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
