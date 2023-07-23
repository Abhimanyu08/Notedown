import React, { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Tldraw } from "@tldraw/tldraw";

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
					<div
						className={`w-2/3 aspect-[4/3] relative`}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="tldraw__editor w-full h-full">
							<Tldraw persistenceKey={persistanceKey} />
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default ExpandedCanvasDisplay;
