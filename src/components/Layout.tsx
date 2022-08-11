import React from "react";

const Layout: React.FC<{ children: JSX.Element[] | JSX.Element }> = ({
	children,
}) => {
	return (
		<div className="border-black border-2 relative min-h-screen h-max w-3/4 mx-auto p-2">
			<div className="mb-10"></div>
			{children}
		</div>
	);
};

// export default withUrqlClient(createUrqlClient, { ssr: true })(Layout);
export default Layout;
