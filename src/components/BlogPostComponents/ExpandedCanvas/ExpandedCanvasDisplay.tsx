import React, { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Tldraw } from "@tldraw/tldraw";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { cn } from "@/lib/utils";
import { AiOutlineClose } from "react-icons/ai";

function ExpandedCanvasDisplay({
	persistanceKey,
	setPersistanceKey,
}: {
	persistanceKey: string;
	setPersistanceKey: Dispatch<SetStateAction<string>>;
}) {
	return (
		<AnimatePresence>
			{persistanceKey && (
				<motion.div
					className="absolute w-screen flex items-center justify-center h-screen bg-black/75 z-[400] cursor-zoom-out"
					onClick={() => setPersistanceKey("")}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ type: "tween", duration: 0.1 }}
				>
					<div className={`w-full h-full px-10 py-5 relative`}>
						<div
							className="tldraw__editor w-full h-full"
							onClick={(e) => e.stopPropagation()}
						>
							<Tldraw persistenceKey={persistanceKey} />
						</div>
					</div>

					<Button
						className={cn(
							"absolute top-[1.5rem] left-[2.8rem] w-fit rounded-full p-3  hover:bg-white hover:text-black z-[500]"
						)}
						variant={"ghost"}
						onClick={() => setPersistanceKey("")}
					>
						<AiOutlineClose />
					</Button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default ExpandedCanvasDisplay;
