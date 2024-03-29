import React from "react";

interface ToolbarButtonProps {
	children: React.ReactNode;
	className?: string;
	tip?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function ToolbarButton({
	children,
	tip,
	className,
	onClick,
}: ToolbarButtonProps) {
	return (
		<button
			className={
				(className || "") +
				" w-fit justify-start tooltip tooltip-top active:scale-95 hover:scale-105"
			}
			onClick={onClick}
			data-tip={tip}
		>
			{children}
		</button>
	);
}

export default ToolbarButton;
