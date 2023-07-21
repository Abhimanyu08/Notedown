"use client";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { useParams, useRouter } from "next/navigation";
import { AiFillCloseCircle } from "react-icons/ai";

function ClosePostPreview() {
	const router = useRouter();
	const params = useParams();
	return (
		<ToolTipComponent
			tip="Close preview (Esc)"
			side="top"
			onClick={() => {
				router.push(`/profile/${params?.id}`);
			}}
			className="absolute top-2 right-[3.75rem] text-gray-300 hover:text-gray-500"
		>
			<AiFillCloseCircle size={30} />
		</ToolTipComponent>
	);
}

export default ClosePostPreview;
