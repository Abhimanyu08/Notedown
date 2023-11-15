import { NotLoggedInOptions } from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import React, { Suspense } from "react";

async function layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Suspense fallback={<></>}>
				<SideSheet
					loggedInChildren={<></>}
					notLoggedInChildren={<NotLoggedInOptions />}
				/>
			</Suspense>
			{children}
		</>
	);
}

export default layout;
