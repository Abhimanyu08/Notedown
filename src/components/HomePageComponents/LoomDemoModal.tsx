"use client";
import React, { useState } from "react";

function LoomDemoModal() {
	const [show, setShow] = useState(false);
	return (
		<>
			<input
				type="checkbox"
				id="youtube-demo"
				checked={show}
				onChange={(e) => setShow(e.target.checked)}
				className="hidden"
			/>
			<label
				className={` text-black ${
					show ? "" : "hidden"
				} absolute top-0 left-0 flex w-full h-full items-center justify-center z-50 bg-slate-800/80`}
				htmlFor="youtube-demo"
			>
				<div className="lg:w-2/3 w-full demo">
					<iframe
						src="https://www.loom.com/embed/74f37debbc004a718c6fd18156ad2fea"
						frameBorder="0"
						allowFullScreen
						className="w-full demo"
					/>
				</div>
			</label>
		</>
	);
}

export default LoomDemoModal;
