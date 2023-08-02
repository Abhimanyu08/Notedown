"use client";
import {
	HtmlAstElement,
	getStartEndFromNode,
} from "@utils/html2Jsx/transformer";
import React, { lazy } from "react";

function ImageHandler({ node }: { node: HtmlAstElement }) {
	const { alt, src } = node.properties as { alt: string; src: string };

	let { end } = getStartEndFromNode(node);
	if (src.split(",").length > 1) {
		const Carousel = lazy(
			() => import("@components/BlogPostComponents/Carousel")
		);
		return (
			<Carousel
				imageNamesString={src}
				captionString={alt}
				key={src}
				end={end}
			/>
		);
	}

	if (src) {
		const ImageWithCaption = lazy(
			() => import("@components/BlogPostComponents/ImageWithCaption")
		);
		return <ImageWithCaption name={src} alt={alt} end={end} key={src} />;
	}
	if (alt && !src) {
		const LexicaImage = lazy(
			() => import("@components/BlogPostComponents/LexicaImage")
		);

		return <LexicaImage alt={alt} key={alt} end={end} />;
	}
	const ImageUploader = lazy(
		() => import("@components/EditorComponents/ImageUploader")
	);
	return <ImageUploader {...{ end }} />;
}

export default ImageHandler;
