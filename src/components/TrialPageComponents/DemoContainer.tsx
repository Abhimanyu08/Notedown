import React from "react";

function DemoContainer({ children }: { children: JSX.Element[] }) {
	return (
		<div className="flex items-center transparent justify-center gap-20 mt-36">
			{children}
		</div>
	);
}

export default DemoContainer;
