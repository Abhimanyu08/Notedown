import Image from "next/image";
import React from "react";
import { BsArrowRepeat } from "react-icons/bs";
import Carousel from "../src/components/Carousel";
import Code from "../src/components/Code";
import DrawingArea from "../src/components/DrawingArea";
import { BlogProps } from "../src/interfaces/BlogProps";
import { SUPABASE_IMAGE_BUCKET } from "./constants";
import getYoutubeEmbedLink from "./getYoutubeEmbedLink";
import { supabase } from "./supabaseClient";
import Latex from "react-latex";

let BLOCK_NUMBER = -1;
interface htmlToJsxProps {
	html: string;
	language: BlogProps["language"];
	ownerId: string;
	imageFolder?: string;
	imageToUrl?: Record<string, string>;
}
function htmlToJsx({
	html,
	language,
	ownerId,
	imageFolder,
	imageToUrl,
}: htmlToJsxProps): JSX.Element {
	const re =
		/([^<>]*?)?(<([a-z0-9]+)( [^<>]*?=\"[^<>]*\")*?>(.|\r|\n)*?<\/\3>)([^<>]*)?/g;
	const matches = Array.from(html.matchAll(re));
	if (matches.length === 0) return <>{html}</>;
	const elem = (
		<>
			{matches.map((match) => {
				const string1 = match.at(1);
				const string2 = match.at(6);
				const elem = match.at(2)!;
				const type = match.at(3);
				if (type === "pre") {
					let code = elem.match(/<code>((.|\r|\n)*)<\/code>/)?.at(1);
					BLOCK_NUMBER += 1;
					return (
						<>
							{string1}
							<Code
								key={BLOCK_NUMBER}
								language={language}
								code={code || ""}
								blockNumber={BLOCK_NUMBER}
							/>
							{string2}
						</>
					);
				}
				if (type === "code") {
					const code = elem
						.match(/<code>((.|\r|\n)*)<\/code>/)
						?.at(1);
					if (code?.startsWith("$") && code.endsWith("$")) {
						return (
							<>
								<span>
									{string1} <Latex>{code}</Latex>
									{string2}
								</span>
							</>
						);
					}
					return (
						<>
							<span className="">
								{string1} <code>{code}</code> {string2}
							</span>
						</>
					);
				}
				const content = elem.match(/<.*?>((.|\n|\r)*)<\/.*>/)?.at(1);

				if (type === "p" && content?.trim().match(/^canvas(\d)*$/)) {
					let canvasName = content
						.trim()
						.match(/^(canvas(\d)*)$/)
						?.at(1);
					return (
						<DrawingArea
							fileName={canvasName}
							imageFolder={imageFolder}
						/>
					);
				}

				const hasImage = Array.from(
					content?.matchAll(
						/((.|\n|\r)*?)?(<img (.*)>)((.|\n|\r)*)/g
					) || []
				);
				if (hasImage.length !== 0 && (imageFolder || imageToUrl)) {
					return Array.from(hasImage).map((imageMatch) => {
						const string1 = imageMatch.at(1);
						const string2 = imageMatch.at(5);
						let attrString = imageMatch.at(4);
						let attrs = makeAttrMap({ match: attrString });
						if (!Object.hasOwn(attrs, "src")) {
							return <></>;
						}
						let src = attrs["src"];

						let imageNames = src.split(",").slice(0, 6);
						if (imageNames.length > 1) {
							let imageUrls: string[] = [];
							let imageCaptions = attrs["alt"]
								.split(",")
								.slice(0, 6);
							imageNames.forEach((imageNameWithExt, idx) => {
								let imageName = imageNameWithExt
									.match(/([^\/]*\..*$)/)
									?.at(0)
									?.trim();
								let imageUrl = undefined;
								if (imageToUrl) {
									if (imageToUrl[imageName || ""])
										imageUrl = imageToUrl[imageName || ""];
								}
								if (imageUrl === undefined) {
									const { publicURL } = supabase.storage
										.from(SUPABASE_IMAGE_BUCKET)
										.getPublicUrl(
											`${imageFolder}/${imageName}`
										);
									imageUrl = publicURL;
								}
								imageUrls.push(imageUrl || "");
							});

							return (
								<>
									<p>
										{htmlToJsx({
											html: string1 || "",
											language,
											ownerId,
											imageFolder,
											imageToUrl,
										})}
									</p>
									<Carousel
										key={src}
										images={imageUrls}
										captions={imageCaptions}
										width={175}
										height={120}
									/>
									{htmlToJsx({
										html: `<p>${string2}</p>` || "",
										language,
										ownerId,
										imageFolder,
										imageToUrl,
									})}
								</>
							);
						}

						let imageUrl = undefined;
						if (src === "") {
							imageUrl = "";
						} else {
							let imageName = src.match(/([^\/]*\..*$)/)?.at(0);
							if (imageToUrl) {
								if (imageToUrl[imageName || ""])
									imageUrl = imageToUrl[imageName || ""];
							}
							if (imageUrl === undefined) {
								const { publicURL } = supabase.storage
									.from(SUPABASE_IMAGE_BUCKET)
									.getPublicUrl(
										`${imageFolder}/${imageName}`
									);
								imageUrl = publicURL;
							}
						}

						return (
							<>
								<p>
									{htmlToJsx({
										html: string1 || "",
										language,
										ownerId,
										imageFolder,
										imageToUrl,
									})}
								</p>
								{/* <div className=""> */}
								{imageUrl === "" ? (
									<div className="w-full aspect-[4/3] flex justify-center">
										<img
											src=""
											alt={attrs["alt"]}
											className="lexica object-contain"
										/>
									</div>
								) : (
									<Image
										src={imageUrl!}
										layout="responsive"
										objectFit="contain"
										width={1440}
										alt={attrs["alt"]}
										height={1080}
									/>
								)}
								<div className="flex items-end justify-center gap-4 ">
									<figcaption className="text-center text-white italic">
										{attrs["alt"]}
									</figcaption>
									{imageUrl === "" && (
										<div className=" text-white lexica-regen">
											<BsArrowRepeat />
										</div>
									)}
								</div>
								{/* </div> */}
								{htmlToJsx({
									html: `<p>${string2}</p>` || "",
									language,
									ownerId,
									imageFolder,
									imageToUrl,
								})}
							</>
						);
					});
				}
				let attrMap = makeAttrMap({
					type,
					content,
					match: match.at(4),
				});
				let src = attrMap["href"];
				if (
					type === "a" &&
					src &&
					(src.startsWith("https://www.youtube.com") ||
						src.startsWith("https://youtu.be")) &&
					!content
				) {
					return (
						<iframe
							className="w-full"
							src={getYoutubeEmbedLink(src)}
							title="YouTube video player"
							frameBorder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						></iframe>
					);
				}
				return (
					<>
						<span>{string1}</span>

						{React.createElement(
							type!,
							attrMap,
							htmlToJsx({
								html: content!,
								language,
								ownerId,
								imageFolder,
								imageToUrl,
							})
						)}
						<span>{string2}</span>
					</>
				);
			})}
		</>
	);
	return elem;
}

function makeAttrMap({
	type,
	content,
	match,
}: {
	type?: string;
	content?: string;
	match?: string;
}) {
	let obj: Record<string, string> = {};
	if (type && /h\d/.test(type)) {
		obj["id"] = content!;
	}
	if (!match) return obj;
	const re = /(.*?)=\"(.*?)\"/g;
	const attrs = Array.from(match.matchAll(re));
	for (const attr of attrs) {
		obj[attr[1].trim()] = attr[2].trim();
	}
	if (type === "a" && !obj["href"].startsWith("#")) obj["target"] = "_blank";
	return obj;
}

export default htmlToJsx;

//to do -> resolve the case when <p>jf;lakjfdal;skdjfas;lkdj<img src="" alt="">
