"use client";
import { BlogProps } from "@/interfaces/BlogProps";
import React, { useContext } from "react";
import { BiCodeAlt } from "react-icons/bi";
import { BlogContext } from "./BlogState";
import { UserContext } from "@/app/appContext";
import prepareContainer from "@/app/utils/prepareContainer";
import ToolbarButton from "./ToolbarButton";
import { AiFillEdit } from "react-icons/ai";
import { TbNews } from "react-icons/tb";

function PrivateToolbar(props: { language: BlogProps["language"] }) {
	const { blogState, dispatch } = useContext(BlogContext);
	const { user } = useContext(UserContext);
	return (
		<>
			{props.language && (
				<ToolbarButton
					className={``}
					onClick={() =>
						prepareContainer(
							blogState.containerId,
							blogState.language
						).then((containerId) => {
							if (!containerId) return;
							dispatch({
								type: "set containerId",
								payload: containerId,
							});
						})
					}
				>
					<BiCodeAlt
						size={30}
						className={` ${
							blogState.containerId
								? "text-lime-400"
								: "text-black dark:text-white"
						} `}
					/>
				</ToolbarButton>
			)}
			<ToolbarButton className="" onClick={() => {}}>
				<AiFillEdit size={28} className="dark:text-white  text-black" />
			</ToolbarButton>
			<ToolbarButton className="" onClick={() => {}}>
				<TbNews className=" dark:text-white text-black" size={30} />
			</ToolbarButton>
		</>
	);
}

export default PrivateToolbar;
