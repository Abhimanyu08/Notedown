import React, { useState } from "react";

function AllScreenDemo() {
	const [screen, setScreen] = useState<"desktop" | "tablet" | "phone">(
		"desktop"
	);
	return (
		<>
			<div className="mt-20 flex mb-10 flex-col items-center gap-2 grow-0 justify-center font-bold text-3xl text-white transparent">
				<span>
					<span className="text-violet-500">Responsive! </span>
					Your posts look good on any device.
				</span>
				<span className="text-sm">
					{" "}
					(Ok, maybe not on an apple watch)
				</span>
				<div className="flex gap-4 text-base mt-5">
					<span
						className={`cursor-pointer ${
							screen === "desktop"
								? "underline decoration-amber-400"
								: ""
						}`}
						onClick={() => setScreen("desktop")}
					>
						Desktop
					</span>
					<span
						className={`cursor-pointer ${
							screen === "tablet"
								? "underline decoration-amber-400"
								: ""
						}`}
						onClick={() => setScreen("tablet")}
					>
						tablet
					</span>

					<span
						className={`cursor-pointer ${
							screen === "phone"
								? "underline decoration-amber-400"
								: ""
						}`}
						onClick={() => setScreen("phone")}
					>
						phone
					</span>
				</div>
			</div>
			<div className="w-full flex justify-center transparent">
				<div
					className={`${screen}  
							 transition-all duration-1000 bg-gradient-to-b border-black shadow-black shadow-lg border-4 rounded-lg from-slate-900 via-slate-800 to-slate-700`}
				>
					<iframe
						src="https://rce-blog.xyz/posts/597"
						className="h-full w-full"
					></iframe>
				</div>
			</div>
		</>
	);
}

export default AllScreenDemo;
