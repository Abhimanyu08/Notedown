import { Dispatch, SetStateAction } from "react";
import { ABOUT_LENGTH } from "../../utils/constants";

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
	if (!owner) {
		return (
			<div
				className="prose prose-code:p-1 text-white prose-headings:text-white prose-sm md:prose-base max-w-full"
				dangerouslySetInnerHTML={{ __html: htmlAbout }}
			></div>
		);
	}

	if (editing) {
		return (
			<>
				{previewing ? (
					<div
						className="prose prose-code:p-1 text-white prose-headings:text-white prose-sm md:prose-base max-w-full"
						dangerouslySetInnerHTML={{ __html: htmlAbout }}
					></div>
				) : (
					<div className="w-full lg:h-1/2 relative">
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
	return (
		<div
			className="prose prose-code:p-1 text-white prose-headings:text-white prose-sm md:prose-base max-w-full"
			dangerouslySetInnerHTML={{ __html: htmlAbout }}
		></div>
	);
}
