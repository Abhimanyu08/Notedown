import React from "react";

function DonationsComponent() {
	return (
		<div className="flex justify-center gap-1 text-white">
			<span>
				Made by{" "}
				<a
					href="https://twitter.com/A_Bhimany_u"
					target="_blank"
					rel="noreferrer"
					className="after:content-['_↗'] text-sky-400 font-bold"
				>
					Abhimanyu
				</a>
				, please consider{" "}
			</span>
			<a
				href="https://www.buymeacoffee.com/iamabhimanm"
				target={"_blank"}
				rel={"noreferrer"}
				className="after:content-['_↗'] text-amber-400 font-bold"
			>
				Buying me a coffee
			</a>
		</div>
	);
}

export default DonationsComponent;
