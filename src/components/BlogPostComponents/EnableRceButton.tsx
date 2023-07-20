"use client";
import Button from "@components/ui/button";
import React, { useContext } from "react";
import { BlogContext } from "./BlogState";
import prepareContainer from "@/app/utils/prepareContainer";
import { BiCodeAlt } from "react-icons/bi";
import { ToolTipComponent } from "@components/ToolTipComponent";

function EnableRceButton({ className }: { className?: string }) {
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	return (
		<ToolTipComponent
			tip={
				blogState.containerId
					? "RCE Enabled"
					: "Enable remote code execution"
			}
		>
			<Button
				className={className}
				onClick={() => {
					console.log(`${blogState.containerId}`);
					prepareContainer(
						blogState.blogMeta.language,
						blogState.containerId
					).then((containerId) => {
						if (!containerId) return;
						blogStateDispatch({
							type: "set containerId",
							payload: containerId,
						});
					});
				}}
			>
				<BiCodeAlt
					size={30}
					className={` ${
						blogState.containerId ? "text-lime-400" : ""
					}`}
				/>
			</Button>
		</ToolTipComponent>
	);
}

export default EnableRceButton;
