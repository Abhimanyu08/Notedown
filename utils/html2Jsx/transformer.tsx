import React from "react";
import { HtmlNode, TextNode } from "./parser";
import Latex from "react-latex";
import Code from "../../src/components/BlogPostComponents/Code";
import { BlogProps } from "../../src/interfaces/BlogProps";
import CodeWithoutLanguage from "../../src/components/BlogPostComponents/CodeWithoutLanguage";
import getYoutubeEmbedLink from "../getYoutubeEmbedLink";
import DrawingOrImage from "../../src/components/BlogPostComponents/DrawingOfImage";
import { supabase } from "../supabaseClient";
import { SUPABASE_IMAGE_BUCKET } from "../constants";
import Carousel from "../../src/components/BlogPostComponents/Carousel";

import Image from "next/image";
import ImageWithCaption from "../../src/components/BlogPostComponents/ImageWithCaption";
import LexicaImage from "../../src/components/BlogPostComponents/LexicaImage";

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
		if (typeof window !== "undefined") {
			let tempElement = document.createElement("div");
			tempElement.innerHTML = code;
			code = tempElement.innerText || tempElement.textContent || "";
		}
		if (code.startsWith("$") && code.endsWith("$")) {
			return <Latex>{code}</Latex>;
		}
		return <code>{code}</code>;
	},

	pre: (node, _, blogMeta) => {
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

	img: (node, _, blogMeta) => {
		const { alt, src } = node.attributes as { alt: string; src: string };

		if (src.split(",").length > 1) {
			const imageUrls = src
				.split(",")
				.map(
					(imageName) =>
						getUrlFromImgname(
							imageName,
							blogMeta.imageFolder,
							blogMeta.imageToUrl
						) || ""
				);

			const captions = alt.split(";");

			return (
				<Carousel
					images={imageUrls}
					captions={captions}
					width={175}
					height={120}
				/>
			);
		}

		if (src) {
			const url =
				getUrlFromImgname(
					src,
					blogMeta.imageFolder,
					blogMeta.imageToUrl
				) || "";
			return <ImageWithCaption src={url} alt={alt} />;
		}
		if (alt && !src) {
			return <LexicaImage alt={alt} />;
		}
		return <p>Invalid Image Elem</p>;
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

function getUrlFromImgname(
	imageName: string,
	imageFolder?: string,
	imageToUrl?: Record<string, string>
) {
	if (imageToUrl && imageToUrl[imageName]) return imageToUrl[imageName];
	return supabase.storage
		.from(SUPABASE_IMAGE_BUCKET)
		.getPublicUrl(`${imageFolder}/${imageName}`).publicURL;
}
