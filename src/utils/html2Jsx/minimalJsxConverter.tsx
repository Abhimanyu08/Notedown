import { cn } from "@/lib/utils";
import { Text } from "hast";
import Image from "next/image";
import { Suspense } from "react";
import {
	HtmlAstElement,
	createHeadingIdFromHeadingText,
	defaultTagToJsx,
	extractTextFromChildren,
	transformer,
} from "./transformer";

import MinimalLatex from "@components/BlogPostComponents/MinimalComponents/MinimalLatex";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import React from "react";
import { TagToJsx } from "./TagToJsx";
import getYoutubeEmbedLink from "@utils/getYoutubeEmbedLink";
const MinimalHeadingCopyButton = React.lazy(
	() =>
		import(
			"@components/BlogPostComponents/MinimalComponents/MinimalHeadingCopyButton"
		)
);

const ExpandableImageContainer = React.lazy(
	() =>
		import(
			"@components/BlogPostComponents/MinimalComponents/ExpandableImageContainer"
		)
);

const MinimalCarousel = React.lazy(
	() =>
		import(
			"@components/BlogPostComponents/MinimalComponents/MinimalCarousel"
		)
);
const MinimalCode = React.lazy(
	() => import("@components/BlogPostComponents/MinimalComponents/MinimalCode")
);
const MinimalCodeSandbox = React.lazy(
	() =>
		import(
			"@components/BlogPostComponents/MinimalComponents/MinimalCodeSandbox"
		)
);
const MinimalNonExCodeblock = React.lazy(
	() =>
		import(
			"@components/BlogPostComponents/MinimalComponents/MinimalNonExCodeblock"
		)
);
const MinimalDrawingSvg = React.lazy(
	() =>
		import(
			"@components/BlogPostComponents/MinimalComponents/MinimalSvgDrawing"
		)
);

type HeadTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export function tagToJsxConverterWithContext({
	fileNamesToUrls,
	language,
	imageFolder,
}: {
	fileNamesToUrls: Record<string, string>;
	imageFolder?: string;

	language?: (typeof ALLOWED_LANGUAGES)[number];
}): TagToJsx {
	const t2J: TagToJsx = {
		...(() => {
			let headingToRenderers: Partial<Record<HeadTags, TagToJsx["h1"]>> =
				{};
			for (let heading of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
				headingToRenderers[heading as HeadTags] = (node) => {
					const headingChildren = node.children;
					const headingText = extractTextFromChildren(
						headingChildren as any
					);
					const headingId =
						createHeadingIdFromHeadingText(headingText);
					return React.createElement(
						node.tagName,
						{
							id: headingId,
							className:
								"group prose flex hover:underline items-center prose-code:text-xl prose-code:mx-1",
						},

						[
							...node.children.map((c) => transformer(c, t2J)),
							<MinimalHeadingCopyButton
								key={headingId}
								headingId={headingId}
							/>,
						]
					);
				};
			}
			return headingToRenderers;
		})(),

		BLOCK_NUMBER: 0,
		blockquote(node) {
			return (
				<blockquote className="[&>p]:after:content-none [&>p]:before:content-none">
					{node.children.map((c) => transformer(c, this))}
				</blockquote>
			);
		},
		img: (node) => {
			const { alt, src } = node.properties as {
				alt: string;
				src: string;
			};
			if (src.split(",").length > 1) {
				return (
					<MinimalCarousel
						src={src}
						alt={alt}
						fileNamesToUrls={fileNamesToUrls}
					/>
				);
			}
			const completeSrc = fileNamesToUrls[src];

			return (
				<ExpandableImageContainer>
					<Image
						src={completeSrc}
						alt={alt}
						width={1440}
						height={1080}
					/>
					<figcaption
						className={cn(
							"text-center italic",
							alt ? "" : "invisible"
						)}
					>
						{alt || "hello"}
					</figcaption>
				</ExpandableImageContainer>
			);
		},

		a: (node) => {
			let { href } = node.properties as { href: string };
			if (!href) href = "";
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
				const footNoteId = linkText[0].value
					.match(footNoteRegex)
					?.at(1);
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

		p(node, converter) {
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
						{transformer(beforeNode, converter)}
						{transformer(imgNode, converter)}
						{nodesAfterImage.length > 0 &&
							transformer(afterNode, converter)}
					</>
				);
			}

			return <p>{node.children.map((c) => transformer(c, converter))}</p>;
		},

		pre(node) {
			let codeNode = node.children[0] as HtmlAstElement;
			let code = (codeNode.children[0] as Text)?.value || "";

			const className = codeNode.properties?.className || [""];
			const blockMetaString =
				/language-(.*)/.exec((className as string[])[0])?.at(1) || "";

			const arr = blockMetaString.split("&");
			// arr = ["lang=javascript","theme=dark","sln=true"]
			const blockMeta: Record<string, string | boolean> = {};

			arr.forEach((bm) => {
				const matcharr = /(.*?)=(.*)/.exec(bm);
				const key = matcharr?.at(1);
				let val: boolean | string | undefined = matcharr?.at(2);
				if (key === "sln") val = val === "true" ? true : false;
				if (key !== undefined && val !== undefined)
					blockMeta[key] = val;
			});
			if (
				["lang", "sln", "theme"].every((i) =>
					Object.hasOwn(blockMeta, i)
				)
			) {
				return (
					<Suspense
						fallback={
							<pre>
								<code>{code}</code>
							</pre>
						}
					>
						<MinimalNonExCodeblock
							code={code}
							language={blockMeta.lang as string}
							showLineNumbers={blockMeta.sln as boolean}
							theme={blockMeta.theme as string}
						/>
					</Suspense>
				);
			}
			if (!language) {
				return (
					<Suspense
						fallback={
							<pre>
								<code>{code}</code>
							</pre>
						}
					>
						<MinimalNonExCodeblock
							code={code}
							language={"javascript"}
							showLineNumbers={false}
							theme={"coldark-dark"}
						/>
					</Suspense>
				);
			}

			this.BLOCK_NUMBER += 1;
			return (
				<MinimalCode
					code={code}
					language={language!}
					blockNumber={this.BLOCK_NUMBER}
					file={(blockMeta.file as any) || ""}
					theme={(blockMeta.theme as any) || ""}
				/>
			);
		},
		code: (node) => {
			const child = node.children[0] as Text;
			// we are constraining the code elements to only contain plain strings.
			let code = child.value;
			if (!code) return <code></code>;
			if (code.startsWith("$") && code.endsWith("$")) {
				return <MinimalLatex code={code} />;
			}
			if (code.startsWith("~~") && code.endsWith("~~")) {
				return <del>{code.slice(2, code.length - 2)}</del>;
			}
			const drawRegex =
				/<draw id=(\d+) caption="(.*?)"( dark=(true|false))?\/>/;
			if (drawRegex.test(code)) {
				const regexArray = drawRegex.exec(code)!;
				const persistanceKey = regexArray.at(1)!;
				const caption = regexArray.at(2) || "";
				if (!imageFolder) return <></>;

				return (
					<Suspense fallback={<p>Loading svg</p>}>
						<MinimalDrawingSvg
							{...{ persistanceKey, caption, imageFolder }}
						/>
					</Suspense>
				);
			}

			const sandboxRegex = /<sandbox id=(\d+)\/>/;
			if (sandboxRegex.test(code)) {
				const regexArray = sandboxRegex.exec(code)!;
				const persistanceKey = regexArray.at(1)!;
				if (!imageFolder) return <></>;

				return (
					<MinimalCodeSandbox
						imageFolder={imageFolder}
						persistanceKey={persistanceKey}
					/>
				);
			}
			return <code>{code}</code>;
		},
	};

	return t2J;
}
