import {
	SandpackProvider,
	SandpackCodeEditor,
	SandpackPreview,
} from "@codesandbox/sandpack-react";
import React from "react";

// const defaultSandpaockProps: SandpackProps = {

// 	template: "react",
// 	files: {
// 		"/App.js": `export default function App() {
//   return <h1>Hello Sandpack</h1>
// }`},

// 	options: {
// 		layout: "console",
// 		closableTabs: true,

// 	}
// }

function Codesandbox({ settingsString }: { settingsString: string }) {
	return (
		<SandpackProvider {...JSON.parse(settingsString)}>
			<div className="flex flex-col gap-2">
				<SandpackCodeEditor style={{ height: 400 }} showTabs={true} />
				<SandpackPreview style={{ aspectRatio: 4 / 2 }} />
			</div>
		</SandpackProvider>
	);
}

export default Codesandbox;
