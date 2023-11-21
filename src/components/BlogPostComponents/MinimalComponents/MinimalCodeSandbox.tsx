import { SUPABASE_FILES_BUCKET } from "@utils/constants";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { cookies } from "next/headers";
import React from "react";
import CustomSandpack from "../CodeSandbox/CustomSandpack";

async function MinimalCodeSandbox({
	imageFolder,
	persistanceKey,
}: {
	imageFolder: string;
	persistanceKey: string;
}) {
	const fileName = imageFolder + "/" + `${persistanceKey}.json`;
	const supabase = createSupabaseServerClient(cookies);
	const { data } = await supabase.storage
		.from(SUPABASE_FILES_BUCKET)
		.download(fileName);

	const jsonString = await data?.text();
	if (!jsonString) return <></>;

	const config = JSON.parse(jsonString);
	return <CustomSandpack {...config} persistanceKey={persistanceKey} />;
}

export default MinimalCodeSandbox;
