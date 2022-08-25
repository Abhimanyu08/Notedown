import { VscPreview } from "react-icons/vsc";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SUPABASE_BLOGGER_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Blogger from "../interfaces/Blogger";
import { AiOutlineFileDone } from "react-icons/ai";
import mdToHtml from "../../utils/mdToHtml";

export function About({
	id,
	editing,
	markdown,
	owner,
	setProfile,
	setEditing,
}: {
	id?: string;
	owner: boolean;
	editing: boolean;
	markdown?: string;
	setProfile: Dispatch<SetStateAction<Blogger | null | undefined>>;
	setEditing: Dispatch<SetStateAction<boolean>>;
}) {
	const [about, setAbout] = useState(markdown);
	const [previewing, setPreviewing] = useState(false);
	const [htmlAbout, setHtmlAbout] = useState("");

	useEffect(() => {
		const aboutMd2Html = async () => {
			if (!about) return;
			const html = await mdToHtml(about);
			setHtmlAbout(html);
		};

		aboutMd2Html();
	}, [previewing]);

	const onAboutSave = async () => {
		const { data, error } = await supabase
			.from(SUPABASE_BLOGGER_TABLE)
			.update({ about })
			.eq("id", id);
		if (error || !data || data.length == 0) {
			alert("Error in updating about");
			return;
		}
		setProfile(data.at(0));
		setEditing(false);
	};

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
			<div className="relative">
				<div className="right-1 top-1 flex gap-2 justify-end mb-1 overflow-visible">
					<div
						className="tooltip"
						data-tip="preview"
						onClick={() => setPreviewing((prev) => !prev)}
					>
						<VscPreview size={20} />
					</div>

					<div
						className="tooltip"
						data-tip="save"
						onClick={onAboutSave}
					>
						<AiOutlineFileDone size={20} />
					</div>
				</div>
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
			</div>
		);
	}
	return (
		<div
			className="prose prose-code:p-1"
			dangerouslySetInnerHTML={{ __html: htmlAbout }}
		></div>
	);
}
