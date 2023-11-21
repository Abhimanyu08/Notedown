import React, { Suspense } from "react";
import {
	HtmlAstElement,
	getStartEndFromNode,
	tagToJsx,
	transformer,
} from "./transformer";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Text } from "hast";

import MinimalCarousel from "@components/BlogPostComponents/MinimalComponents/MinimalCarousel";
import Code from "@components/BlogPostComponents/Code";
import MinimalNonExCodeblock from "@components/BlogPostComponents/MinimalComponents/MinimalNonExCodeblock";
let BLOCK_NUMBER = 0;

export function tagToJsxConverterWithContext({
	fileNamesToUrls,
}: {
	fileNamesToUrls: Record<string, string>;
}): typeof tagToJsx {
	const t2J: typeof tagToJsx = {
		...tagToJsx,
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
				<div className="flex flex-col">
					<div className="w-4/5 mx-auto relative">
						<figure className="w-full mb-4 mx-auto">
							<Image
								src={completeSrc}
								alt={alt}
								width={1440}
								height={1080}
								className="cursor-zoom-in"
							/>
							<figcaption
								className={cn(
									"text-center italic",
									alt ? "" : "invisible"
								)}
							>
								{alt || "hello"}
							</figcaption>
						</figure>
					</div>
				</div>
			);
		},

		p: (node, converter) => {
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
			// if (
			// 	node.children[0].type === "text" &&
			// 	/^\[(\d+)\]:/.test(node.children[0].value)
			// ) {
			// 	//This is a footnote
			// 	const firstChild = node.children[0].value;
			// 	const footnoteId = firstChild.match(/^\[(\d+)\]/)?.at(1);
			// 	const remainingTextOfFirstChild = firstChild
			// 		.match(/^\[\d+\]:(.*)/)
			// 		?.at(1);

			// 	const newFirstChild: Text = {
			// 		type: "text",
			// 		value: remainingTextOfFirstChild || "",
			// 	};

			// 	const newPNode: HtmlAstElement = {
			// 		type: "element",
			// 		tagName: "span",
			// 		properties: {
			// 			id: `footnote-${footnoteId}`,
			// 			className: "footnote-reference",
			// 		},
			// 		children: [newFirstChild, ...node.children.slice(1)],
			// 	};
			// 	footNotes.push({ id: parseInt(footnoteId || "0"), node: newPNode });
			// 	return <></>;
			// }

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
				if (key !== undefined && val !== undefined)
					blockMeta[key] = val;
			});
			if (
				["lang", "sln", "theme"].every((i) =>
					Object.hasOwn(blockMeta, i)
				)
			) {
				console.log(blockMeta);
				return (
					// <Suspense
					// 	fallback={
					// 		<pre>
					// 			<code>{code}</code>
					// 		</pre>
					// 	}
					// >
					<MinimalNonExCodeblock
						code={code}
						language={blockMeta.lang as string}
						showLineNumbers={blockMeta.sln as boolean}
						theme={blockMeta.theme as string}
					/>
					// </Suspense>
				);
			}

			BLOCK_NUMBER += 1;
			return (
				<Code
					code={code}
					key={BLOCK_NUMBER}
					blockNumber={BLOCK_NUMBER}
					{...{
						start: start + blockMetaString.length + 4,
						end: end - 4,
					}}
					file={(blockMeta.file as any) || ""}
					theme={(blockMeta.theme as any) || ""}
				/>
			);
		},
	};

	return t2J;
}
