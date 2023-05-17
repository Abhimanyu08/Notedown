import React from "react";

interface ToolbarButtonProps {
	children: React.ReactNode;
	tip: string;
	className: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}

function ToolbarButton({
	children,
	tip,
	className,
	onClick,
}: ToolbarButtonProps) {
	return (
		<button
			className={className + " w-fit px-3 tooltip"}
			onClick={onClick}
			data-tip={tip}
		>
			{children}
		</button>
	);
}

export default ToolbarButton;
