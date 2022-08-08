import React from "react";

const Layout: React.FC<{ children: JSX.Element[] }> = ({ children }) => {
	return <div className="bg-red-200 h-screen w-3/4 mx-auto">{children}</div>;
};

// export default withUrqlClient(createUrqlClient, { ssr: true })(Layout);
export default Layout;
