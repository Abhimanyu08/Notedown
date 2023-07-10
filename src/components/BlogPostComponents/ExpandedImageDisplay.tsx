import React, { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

function ExpandedImageDisplay({
	imageUrl,
	setImageUrl,
}: {
	imageUrl: string;
	setImageUrl: Dispatch<SetStateAction<string>>;
}) {
	return (
		<AnimatePresence>
			{imageUrl && (
				<motion.div
					className="absolute w-screen flex items-center justify-center h-screen bg-black/40 z-50 cursor-zoom-out"
					onClick={() => setImageUrl("")}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ type: "tween" }}
				>
					<div
						className={`w-4/5 h-4/5 relative ${
							imageUrl.includes("canvas") ? "bg-white" : ""
						}`}
					>
						<Image
							alt="expanded image"
							src={imageUrl}
							fill
							style={{ objectFit: "contain" }}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default ExpandedImageDisplay;
