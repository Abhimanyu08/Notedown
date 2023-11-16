"use client";
import {
	HtmlAstElement,
	getStartEndFromNode,
} from "@utils/html2Jsx/transformer";
import { usePathname } from "next/navigation";
import React, { lazy } from "react";
const ImageWithCaption = lazy(
	() => import("@components/BlogPostComponents/ImageWithCaption")
);
const Carousel = lazy(() => import("@components/BlogPostComponents/Carousel"));
const LexicaImage = lazy(
	() => import("@components/BlogPostComponents/LexicaImage")
);
const ImageUploader = lazy(
	() => import("@components/EditorComponents/ImageUploader")
);
function ImageHandler({ node }: { node: HtmlAstElement }) {
	const { alt, src } = node.properties as { alt: string; src: string };
	const pathname = usePathname();

	let { end } = getStartEndFromNode(node);
	if (src.split(",").length > 1) {
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
		return <ImageWithCaption name={src} alt={alt} end={end} key={src} />;
	}
	if (alt && !src) {
		return <LexicaImage alt={alt} key={alt} end={end} />;
	}

	if (pathname?.startsWith("/write")) {
		return <ImageUploader {...{ end }} />;
	}
	return <></>;
}

export default ImageHandler;
