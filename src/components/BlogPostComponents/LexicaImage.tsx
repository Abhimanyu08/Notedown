"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import ImageUploader from "@components/EditorComponents/ImageUploader";
import { getImages } from "@utils/sendRequest";
import { usePathname } from "next/navigation";
import React, { memo, useContext, useEffect, useState } from "react";
import { BsArrowRepeat } from "react-icons/bs";

function LexicaImage({ alt }: { alt: string }) {
	const [lexicaLinks, setLexicaLinks] = useState<string[]>([]);
	const [generate, setGenerate] = useState(false);
	const [lexicaLinkNumber, setLexicaLinkNumber] = useState(0);
	const { editorState } = useContext(EditorContext);
	const pathname = usePathname();

	useEffect(() => {
		if (!pathname?.startsWith("/write")) {
			setGenerate(true);
		}
	}, [pathname]);

	useEffect(() => {
		if (!generate) return;
		getImages({ caption: alt }).then((imageLinks) => {
			setLexicaLinks(imageLinks);
			setLexicaLinkNumber(0);
		});
	}, [generate]);

	useEffect(() => {
		const lexicaImageElem = document.getElementById(alt);
		if (!lexicaImageElem) return;
		(lexicaImageElem as HTMLImageElement).src =
			lexicaLinks[lexicaLinkNumber];
	}, [lexicaLinkNumber, lexicaLinks]);

	const onSelect = (link: string) => {
		const view = editorState.editorView;
		if (!view) return;
		const cursorPos = view.state.selection.ranges[0].from;
		view.dispatch({
			changes: {
				from: cursorPos + 2,
				insert: link,
			},
		});
	};

	if (generate) {
		return (
			<div className="w-full mb-4">
				<div className="w-full aspect-video">
					<img
						src=""
						alt={alt}
						style={{ height: "100%", margin: "auto" }}
						id={alt}
					/>
				</div>
				<figcaption
					className={`text-center italic text-gray-400 text-[0.875em]`}
				>
					{alt}
				</figcaption>

				<div className="flex gap-2 items-center justify-center mt-2">
					<button
						className=" text-white lexica-regen rounded-full hover:bg-gray-800 active:scale-95 p-1"
						onClick={() => {
							setLexicaLinkNumber((prev) => {
								return (prev + 1) % lexicaLinks.length;
							});
						}}
					>
						<BsArrowRepeat />
					</button>
					<button
						className="text-xs bg-black border-[1px] border-gray-100 hover:bg-gray-900 text-gray-100 no-scale active:scale-95  px-3 rounded-sm w-fit "
						onClick={() => onSelect(lexicaLinks[lexicaLinkNumber])}
					>
						Select
					</button>
					<button
						className="text-xs bg-black border-[1px] border-gray-100 hover:bg-gray-900 text-gray-100 no-scale active:scale-95  px-3 rounded-sm w-fit "
						onClick={() => setGenerate(false)}
					>
						Cancel
					</button>
				</div>
			</div>
		);
	}
	return (
		<div className="flex flex-col items-center">
			<button
				className="bg-black hover:bg-gray-900 active:scale-95 text-gray-100 border-[1px] border-gray-200 px-3 my-5 py-1 rounded-sm w-fit mx-auto no-scale"
				onClick={() => setGenerate(true)}
			>
				Generate Image for <span className="font-semibold">{alt}</span>
			</button>
			<div className="divider text-gray-200">Or</div>
			<ImageUploader />
		</div>
	);
}

export default memo(LexicaImage);
