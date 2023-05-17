import React from "react";

interface ToolbarButtonProps {
	children: React.ReactNode;
	className: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}

function ToolbarButton({ children, className, onClick }: ToolbarButtonProps) {
	return (
		<button className={className + " w-fit px-3"} onClick={onClick}>
			{children}
		</button>
	);
}

export default ToolbarButton;
