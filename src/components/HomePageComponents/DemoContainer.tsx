import React from "react";

function DemoContainer({
	children,
	reverse,
}: {
	children: JSX.Element[];
	reverse?: boolean;
}) {
	return (
		<div
			className={` flex flex-col lg:flex-row items-center lg:transparent justify-center gap-4 lg:gap-20 mt-14 md:mt-36 ${
				reverse ? "flex-col-reverse" : ""
			}`}
		>
			{children}
		</div>
	);
}

export default DemoContainer;
