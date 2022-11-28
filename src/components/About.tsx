import { Dispatch, SetStateAction, useMemo } from "react";
import { ABOUT_LENGTH } from "../../utils/constants";
import htmlToJsx from "../../utils/htmlToJsx";
import mdToHtml from "../../utils/mdToHtml";

export function About({
	editedAbout,
	setAbout,
	editedHtmlAbout,
	originalHtmlAbout,
	editing,
	owner,
	previewing,
}: {
	editedAbout: string;
	setAbout: Dispatch<SetStateAction<string | undefined>>;
	originalHtmlAbout: string;
	editedHtmlAbout: string;
	owner: boolean;
	editing: boolean;
	previewing: boolean;
}) {
	// console.log("About ----------------->", about);

	const aboutJSX = useMemo(() => {
		return (
			<div className="prose prose-code:bg-black prose-pre:bg-black prose-code:text-amber-400 md:prose-headings:my-4 prose-headings:my-2  text-white prose-headings:text-amber-400 prose-sm md:prose-base max-w-full pb-10">
				{htmlToJsx({
					html: originalHtmlAbout,
				})}
			</div>
		);
	}, [originalHtmlAbout]);

	const editedAboutJsx = useMemo(() => {
		return (
			<div className="prose prose-code:bg-black prose-pre:bg-black prose-code:text-amber-400 md:prose-headings:my-4 prose-headings:my-2  text-white prose-headings:text-amber-400 prose-sm md:prose-base max-w-full pb-10">
				{htmlToJsx({
					html: editedHtmlAbout,
				})}
			</div>
		);
	}, [editedHtmlAbout]);

	if (editing) {
		return (
			<>
				{previewing ? (
					editedAboutJsx
				) : (
					<div className="w-full h-full lg:h-1/2 relative">
						<p className="absolute top-3 lg:right-8 right-6 text-sm text-amber-400">
							{editedAbout.length}/{ABOUT_LENGTH}
						</p>
						<textarea
							className="textarea w-full h-full"
							placeholder="Markdown enabled"
							onChange={(e) => {
								if (e.target.value.length <= ABOUT_LENGTH)
									setAbout(e.target.value);
							}}
							value={editedAbout}
						/>
					</div>
				)}
			</>
		);
	}
	if (editedAbout === "") {
		return (
			<div className="flex h-full w-full justify-center">
				{owner ? (
					<p className="mt-10 text-white/70">
						Write something about yourself by clicking the Edit
						button
					</p>
				) : (
					<p>This person is still finding about himself</p>
				)}
			</div>
		);
	}
	return aboutJSX;
}
