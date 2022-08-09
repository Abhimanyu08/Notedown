import React from "react";

const Layout: React.FC<{ children: JSX.Element[] | JSX.Element }> = ({
	children,
}) => {
	return (
		<div className="relative border-2 border-black h-screen w-3/4 mx-auto p-2">
			{children}
		</div>
	);
};

// export default withUrqlClient(createUrqlClient, { ssr: true })(Layout);
export default Layout;
