"use client";

import { useSupabase } from "@/app/appContext";
import { cn } from "@/lib/utils";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { SUPABASE_FILES_BUCKET } from "@utils/constants";
import { useContext, useEffect, useState } from "react";
import { VscLoading } from "react-icons/vsc";
import TLDrawing from "./TLDrawing";

export default function DrawingSvg({
	persistanceKey,
	caption,
}: {
	persistanceKey: string;
	caption: string;
}) {
	const { blogState } = useContext(BlogContext);
	const { supabase } = useSupabase();
	const [svgMounted, setSvgMounted] = useState(false);
	const [expand, setExpand] = useState(false);

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
			svgElement.style.width = "100%";
			svgElement.style.height = "100%";

			const containerElem = document.getElementById(
				`svgContainer-${persistanceKey}`
			);
			containerElem?.replaceChildren(svgElement);
			setSvgMounted(true);
		});
	}, []);
	// useEffect(() => {
	// 	if (expand) {
	// 		const svgElem = document.getElementById(`svg-${persistanceKey}`);
	// 		// svgEleim?.setAttribute("preserveAspectRatio", "xMinYMin slice");
	// 		if (!svgElem) return;
	// 		svgElem.style.width = "100%";
	// 		svgElem.style.height = "100%";
	// 	}
	// }, [expand]);

	return (
		<div
			className={cn(
				"flex  flex-col w-full h-auto items-center justify-center z-[600]"
			)}
			onClick={() => setExpand((p) => !p)}
		>
			<div
				className={cn(
					"flex w-full justify-center items-center gap-5",
					expand
						? "fixed top-0 left-0 h-full p-10 [&>*]:cursor-zoom-out bg-black/80  overflow-auto "
						: " [&>*]:cursor-zoom-in"
				)}
				id={`svgContainer-${persistanceKey}`}
			>
				<VscLoading className="animate-spin" size={24} />
				<span>Loading your canvas drawing</span>
			</div>
			{svgMounted && caption && (
				<figcaption className="text-center italic">
					{caption}
				</figcaption>
			)}
		</div>
	);
}

function jsonToSvg(svgJson: string) {
	const parsedJson = JSON.parse(svgJson) as Record<string, string>;
	const svgElement = document.createElementNS<"svg">(
		"http://www.w3.org/2000/svg",
		parsedJson.tagName as "svg"
	);

	// Set attributes and properties
	for (const [key, value] of Object.entries(parsedJson)) {
		if (key !== "tagName" && key !== "innerHTML") {
			svgElement.setAttribute(key, value);
		}
	}

	// If you want to include the inner HTML of the SVG element:
	// svgElement.preserveAspectRatio = "xMidYMid meet";
	svgElement.innerHTML = parsedJson.innerHTML;

	return svgElement;
}

// Assuming you have the JSON representation of the SVG stored in a variable named "svgJson"
