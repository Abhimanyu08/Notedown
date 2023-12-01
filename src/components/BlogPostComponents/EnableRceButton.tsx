"use client";
import { useSupabase } from "@/app/appContext";
import useSetContainer from "@/hooks/useSetContainer";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Code } from "lucide-react";
import { useContext, useState } from "react";
import { VscLoading } from "react-icons/vsc";
import { BlogContext } from "./BlogState";
import { LoginDialog } from "./LoginDialog";

function EnableRceButton({
	side,
}: {
	side?: "top" | "left" | "right" | "bottom";
}) {
	const { blogState } = useContext(BlogContext);
	const { startPreparingContainer, preparingContainer } = useSetContainer();
	const [openLoginDialog, setOpenLoginDialog] = useState(false);

	const { session } = useSupabase();
	if (!blogState.language) {
		return <></>;
	}
	return (
		<>
			<ToolTipComponent
				tip={` 
					${
						blogState.containerId
							? "Remote code execution enabled"
							: "Enable remote code execution"
					}
					 `}
				onClick={() => {
					if (!session?.user) {
						setOpenLoginDialog(true);
						return;
					}
					startPreparingContainer();
				}}
				className={`text-gray-400 hover:text-white active:scale-95`}
				side={side}
				align="center"
			>
				{preparingContainer ? (
					<VscLoading size={30} className="animate-spin" />
				) : (
					<Code
						size={26}
						className={` ${
							blogState.containerId && "text-lime-400"
						}`}
					/>
				)}
			</ToolTipComponent>

			<LoginDialog
				dialog="Please login to execute code"
				open={openLoginDialog}
				setOpen={setOpenLoginDialog}
			/>
		</>
	);
}

export default EnableRceButton;
