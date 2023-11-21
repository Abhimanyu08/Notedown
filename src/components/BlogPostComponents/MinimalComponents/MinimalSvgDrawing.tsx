import { cn } from "@/lib/utils";
import { SUPABASE_FILES_BUCKET } from "@utils/constants";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { cookies } from "next/headers";

export default async function MinimalDrawingSvg({
	persistanceKey,
	caption,
	imageFolder,
}: {
	persistanceKey: string;
	imageFolder: string;
	caption: string;
}) {
	const supabase = createSupabaseServerClient(cookies);

	const getFileData = async () => {
		const fileFolder = imageFolder;
		const { data: fileData } = await supabase.storage
			.from(SUPABASE_FILES_BUCKET)
			.download(fileFolder + "/" + `${persistanceKey}.json`);

		const json = await fileData?.text();
		return json;
	};

	const svgJson = await getFileData();

	if (!svgJson) return <></>;
	const svgElement = jsonToSvg(svgJson);

	return (
		<div
			className={cn(
				"flex  flex-col w-full h-auto items-center justify-center z-[600]"
			)}
		>
			<div
				className={cn(
					"flex w-full justify-center items-center gap-5 ",
					" [&>*]:cursor-zoom-in"
				)}
				id={`svgContainer-${persistanceKey}`}
			>
				{svgElement}
			</div>
			<figcaption className="text-center italic">{caption}</figcaption>
		</div>
	);
}

function jsonToSvg(svgJson: string) {
	const parsedJson = JSON.parse(svgJson) as Record<string, string>;
	// const svgElement = document.createElementNS<"svg">(
	// 	"http://www.w3.org/2000/svg",
	// 	parsedJson.tagName as "svg"
	// );

	const attributes: Record<string, any> = {};
	// Set attributes and properties
	for (const [key, value] of Object.entries(parsedJson)) {
		if (key !== "tagName" && key !== "innerHTML") {
			if (key === "style") {
				let styleProp = formatStyle(value);
				attributes["style"] = styleProp;
				continue;
			}

			attributes[dashesToCamelCase(key)] = value;
		}
	}

	return (
		<svg
			{...attributes}
			dangerouslySetInnerHTML={{ __html: parsedJson.innerHTML }}
		></svg>
	);
}

function dashesToCamelCase(property: string) {
	return property
		.split("-")
		.map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
		.join("");
}

function formatStyle(style: string) {
	const regex = /(.*):(.*);$/g;
	const matches = style.matchAll(regex);
	const styleProp: Record<string, string> = {};
	for (let match of Array.from(matches)) {
		const key = dashesToCamelCase(match.at(1)!);
		const value = match.at(2)!.trim();
		styleProp[key] = value;
	}

	return styleProp;
}

// Assuming you have the JSON representation of the SVG stored in a variable named "svgJson"
