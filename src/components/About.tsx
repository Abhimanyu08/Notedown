import { Dispatch, SetStateAction, useMemo } from "react";
import { ABOUT_LENGTH } from "../../utils/constants";
import htmlToJsx from "../../utils/htmlToJsx";

export function About({
	about,
	setAbout,
	htmlAbout,
	editing,
	owner,
	previewing,
}: {
	about: string;
	setAbout: Dispatch<SetStateAction<string | undefined>>;
	htmlAbout: string;
	owner: boolean;
	editing: boolean;
	previewing: boolean;
}) {
	const aboutJSX = useMemo(() => {
		return (
			<div className="prose prose-code:bg-black prose-pre:bg-black prose-code:text-amber-400 md:prose-headings:my-4 prose-headings:my-2  text-white prose-headings:text-amber-400 prose-sm md:prose-base max-w-full">
				{htmlToJsx({
					html: htmlAbout,
				})}
			</div>
		);
	}, [htmlAbout]);

	if (editing) {
		return (
			<>
				{previewing ? (
					aboutJSX
				) : (
					<div className="w-full h-full lg:h-1/2 relative">
						<p className="absolute top-3 lg:right-8 right-6 text-sm text-amber-400">
							{about.length}/{ABOUT_LENGTH}
						</p>
						<textarea
							className="textarea w-full h-full"
							placeholder="Markdown enabled"
							onChange={(e) => {
								if (e.target.value.length <= ABOUT_LENGTH)
									setAbout(e.target.value);
							}}
							value={about}
						/>
					</div>
				)}
			</>
		);
	}
	if (about === "") {
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
