import React from "react";
import { HtmlAstElement, tagToJsx, transformer } from "./transformer";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { Text } from "hast";
import Ptag from "@components/BlogPostComponents/Ptag";

export function tagToJsxConverterWithContext({
	fileNamesToUrls,
}: {
	fileNamesToUrls: Record<string, string>;
}): typeof tagToJsx {
	const t2J: typeof tagToJsx = {
		...tagToJsx,
		img: (node) => {
			console.log("image tag being handled by minimal jsx converter");
			const { alt, src } = node.properties as {
				alt: string;
				src: string;
			};
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
	};

	return t2J;
}
