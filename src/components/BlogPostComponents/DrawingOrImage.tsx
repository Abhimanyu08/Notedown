"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { useContext, useEffect, useState } from "react";
import TLDrawing from "./TLDrawing";
import { ExpandedImageContext } from "./ExpandedImageProvider";
import { useSupabase } from "@/app/appContext";
import { SUPABASE_FILES_BUCKET } from "@utils/constants";
import { VscLoading } from "react-icons/vsc";

export default function TldrawingOrSvg({
	persistanceKey,
}: Parameters<typeof TLDrawing>[0]) {
	const pathname = usePathname();

	const { blogState } = useContext(BlogContext);
	const { supabase } = useSupabase();
	const [svgMounted, setSvgMounted] = useState(false);

	const getFileData = async (fileName: string) => {
		const { imageFolder, blogger, id } = blogState.blogMeta;
		const fileFolder = imageFolder || `${blogger?.id}/${id}`;
		const { data: fileData } = await supabase.storage
			.from(SUPABASE_FILES_BUCKET)
			.download(fileFolder + "/" + `${fileName}.json`);
		const json = await fileData?.text();
		return json;
	};

	useEffect(() => {
		if (svgMounted) return;

		getFileData(persistanceKey).then((jsonString) => {
			if (!jsonString) {
				setSvgMounted(true);
				return;
			}
			const svgElement = jsonToSvg(jsonString);

			const containerElem = document.getElementById("svgContainer");
			containerElem?.replaceChildren(svgElement);
			setSvgMounted(true);
		});
	}, []);

	if (pathname?.startsWith("/write")) {
		return <TLDrawing persistanceKey={persistanceKey} />;
	}

	return (
		<div className="w-full h-auto flex justify-center" id="svgContainer">
			<div className="flex flex-col w-full items-center gap-5 border-t-[1px] border-b-[1px] border-border p-5">
				<VscLoading className="animate-spin" size={24} />
				<span>Loading your canvas drawing</span>
			</div>
		</div>
	);
}

function jsonToSvg(svgJson: string) {
	const parsedJson = JSON.parse(svgJson);
	const svgElement = document.createElementNS(
		"http://www.w3.org/2000/svg",
		parsedJson.tagName
	);

	// Set attributes and properties
	for (const [key, value] of Object.entries(parsedJson)) {
		if (key !== "tagName" && key !== "innerHTML") {
			svgElement.setAttribute(key, value);
		}
	}

	// If you want to include the inner HTML of the SVG element:
	svgElement.innerHTML = parsedJson.innerHTML;

	return svgElement;
}

// Assuming you have the JSON representation of the SVG stored in a variable named "svgJson"
