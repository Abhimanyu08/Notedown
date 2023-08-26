"use client";
import useSetContainer from "@/hooks/useSetContainer";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { useContext } from "react";
import { BiCodeAlt } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import { BlogContext } from "./BlogState";

function EnableRceButton({
	side,
}: {
	side?: "top" | "left" | "right" | "bottom";
}) {
	const { blogState } = useContext(BlogContext);
	const { startPreparingContainer, preparingContainer } = useSetContainer();
	if (!blogState.blogMeta.language) {
		return <></>;
	}
	return (
		<ToolTipComponent
			tip={` 
					${
						blogState.containerId
							? "Remote code execution enabled"
							: "Enable remote code execution"
					}
					 `}
			onClick={startPreparingContainer}
			className={`text-gray-400 hover:text-white active:scale-95`}
			side={side}
			align="center"
		>
			{preparingContainer ? (
				<VscLoading size={30} className="animate-spin" />
			) : (
				<BiCodeAlt
					size={30}
					className={` ${blogState.containerId && "text-lime-400"}`}
				/>
			)}
		</ToolTipComponent>
	);
}

export default EnableRceButton;
