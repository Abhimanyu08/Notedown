import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { UserContext } from "./_app";

const DynamicDrawingComponenet = dynamic(
	() => import(`../components/TLDrawing`),
	{ ssr: false }
);

function Trial() {
	const { user } = useContext(UserContext);
	const router = useRouter();

	return (
		<Layout user={user || null} route={router.asPath}>
			{/* {user ? (
				<DynamicDrawingComponenet
					trialFolder={`${user?.id}/trial.png`}
				/>
			) : (
				<></>
			)} */}
		</Layout>
	);
}

export default Trial;
