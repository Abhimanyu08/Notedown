import Code from "@components/BlogPostComponents/Code";
import { Text } from "hast";
import HeadingButton from "@components/BlogPostComponents/HeadinglinkButton";
import NonExecutableCodeblock from "@components/BlogPostComponents/CodeWithoutLanguage";
import CodeWord from "@components/BlogPostComponents/CodeWord";
import getYoutubeEmbedLink from "../getYoutubeEmbedLink";
import ImageHandler from "@components/BlogPostComponents/ImageHandler";
import Ptag from "@components/BlogPostComponents/Ptag";
import {
	HtmlAstElement,
	createHeadingIdFromHeadingText,
	defaultTagToJsx,
	extractTextFromChildren,
	getStartEndFromNode,
	transformer,
} from "./transformer";
import { TagToJsx } from "./TagToJsx";
import React from "react";

let BLOCK_NUMBER = 0;

export const tagToJsx: TagToJsx = {
	footnotes: [],
	...(() => {
		let headingToRenderers: Partial<Record<HeadTags, TagToJsx["h1"]>> = {};
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

		const className = codeNode.properties?.className || [""];
		const blockMetaString =
			/language-(.*)/.exec((className as string[])[0])?.at(1) || "";

		const { start, end } = getStartEndFromNode(codeNode);
		const arr = blockMetaString.split("&");
		// arr = ["lang=javascript","theme=dark","sln=true"]
		const blockMeta: Record<string, string | boolean> = {};

		arr.forEach((bm) => {
			const matcharr = /(.*?)=(.*)/.exec(bm);
			const key = matcharr?.at(1);
			let val: boolean | string | undefined = matcharr?.at(2);
			if (key === "sln") val = val === "true" ? true : false;
			if (key !== undefined && val !== undefined) blockMeta[key] = val;
		});
		if (
			["lang", "sln", "theme"].every((i) => Object.hasOwn(blockMeta, i))
		) {
			return (
				<NonExecutableCodeblock
					code={code}
					language={blockMeta.lang as string}
					showLineNumbers={blockMeta.sln as boolean}
					theme={blockMeta.theme as string}
					start={start}
				/>
			);
		}

		BLOCK_NUMBER += 1;
		return (
			<Code
				code={code}
				key={BLOCK_NUMBER}
				blockNumber={BLOCK_NUMBER}
				{...{ start: start + blockMetaString.length + 4, end: end - 4 }}
				file={(blockMeta.file as any) || ""}
				theme={(blockMeta.theme as any) || ""}
			/>
		);
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

	p(node) {
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
		const footNoteRegex = /^(\d+):(.*)/;
		if (
			node.children[0].type === "text" &&
			footNoteRegex.test(node.children[0].value)
		) {
			//This is a footnote
			const firstChild = node.children[0].value;
			const footnoteId = firstChild.match(footNoteRegex)?.at(1);
			const remainingTextOfFirstChild = firstChild
				.match(footNoteRegex)
				?.at(2);

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
			this.footnotes!.push({
				id: parseInt(footnoteId || "0"),
				node: newPNode,
			});
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
					{transformer(beforeNode, tagToJsx)}
					{transformer(imgNode, tagToJsx)}
					{nodesAfterImage.length > 0 &&
						transformer(afterNode, tagToJsx)}
				</>
			);
		}

		return <Ptag element={beforeNode} />;
	},

	img: (node) => {
		return <ImageHandler node={node} />;
	},
};

type HeadTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

function headingsRenderer(node: HtmlAstElement) {
	const headingChildren = node.children;
	const headingText = extractTextFromChildren(headingChildren as any);
	const headingId = createHeadingIdFromHeadingText(headingText);
	const { start } = getStartEndFromNode(node);
	return React.createElement(
		node.tagName,
		{
			id: headingId,
			className: "group prose-code:text-xl prose-code:mx-1",
		},

		<HeadingButton headingId={headingId} start={start}>
			{headingChildren.map((child) => transformer(child, tagToJsx))}
		</HeadingButton>
	);
}
