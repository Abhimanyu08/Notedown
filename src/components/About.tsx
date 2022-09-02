import { Dispatch, SetStateAction } from "react";

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
				className="prose prose-code:p-1"
				dangerouslySetInnerHTML={{ __html: htmlAbout }}
			></div>
		);
	}

	if (editing) {
		return (
			<>
				{previewing ? (
					<div
						className="prose prose-code:p-1"
						dangerouslySetInnerHTML={{ __html: htmlAbout }}
					></div>
				) : (
					<textarea
						className="textarea w-full"
						placeholder="Markdown enabled"
						onChange={(e) => setAbout(e.target.value)}
						value={about}
					/>
				)}
			</>
		);
	}
	return (
		<div
			className="prose prose-code:p-1 text-white"
			dangerouslySetInnerHTML={{ __html: about }}
		></div>
	);
}
