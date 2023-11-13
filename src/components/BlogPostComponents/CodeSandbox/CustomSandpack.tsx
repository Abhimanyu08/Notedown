import {
	SandpackCodeEditor,
	SandpackConsole,
	SandpackFileExplorer,
	SandpackPreview,
	SandpackProvider,
	SandpackTheme,
} from "@codesandbox/sandpack-react";

import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import Tabs, { TabChildren } from "@components/ui/tabs";
import { useEffect, useState, lazy } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { SandpackConfigType } from "./types";
import { usePathname } from "next/navigation";

const JsonUpdater = lazy(() => import("./JsonUpdater"));

function CustomSandpack(
	props: SandpackConfigType & { persistanceKey: string }
) {
	const [previewOrConsole, setPreviewOrConsole] = useState<
		"preview" | "console"
	>("preview");
	const [expand, setExpand] = useState(false);
	const [theme, setTheme] = useState<
		SandpackTheme | "auto" | "light" | "dark"
	>();
	const pathname = usePathname();

	useEffect(() => {
		if (!props.theme) return;
		const givenTheme = props.theme;
		if (
			givenTheme === "auto" ||
			givenTheme === "dark" ||
			givenTheme === "light"
		) {
			setTheme(givenTheme);
			return;
		}
		import("@codesandbox/sandpack-themes").then((val) => {
			setTheme(val[givenTheme]);
		});
	}, [props.theme]);

	return (
		<SandpackProvider
			template={props.template}
			files={props.files}
			theme={theme}
		>
			{pathname?.includes("/write") && (
				<JsonUpdater
					persistanceKey={props.persistanceKey}
					template={props.template}
				/>
			)}
			<div
				className={cn(
					"flex flex-col relative w-full border-border border-2",
					expand &&
						"flex flex-row fixed top-0 left-0 w-full h-full [&>:not(.fixed)]:border-b-2  p-10 [&>:not(.fixed)]:border-t-2 [&>:not(.fixed)]:border-l-2  bg-black/90 z-[700]"
				)}
			>
				<ToolTipComponent
					tip="Expand"
					className={cn(
						"absolute top-1 right-2 z-[300]",
						expand && "fixed top-2 right-2",
						"p-2 rounded-full  hover:bg-popover/80",
						"text-white "
					)}
					onClick={() => setExpand((p) => !p)}
				>
					{expand ? (
						<AiOutlineCloseCircle size={24} />
					) : (
						<BsArrowsAngleExpand size={16} />
					)}
				</ToolTipComponent>
				{expand && props.options.showFilesInExpandedMode && (
					<SandpackFileExplorer className="basis-2/12 border-border" />
				)}

				<div
					className={cn(
						"border-border",
						expand
							? "w-1/2 shrink overflow-x-scroll"
							: "w-full border-b-2"
					)}
				>
					<SandpackCodeEditor
						{...props.options}
						showTabs={
							props.options.editorHeight === 0 && !expand
								? false
								: props.options.showTabs
						}
						style={{
							height: expand
								? "100%"
								: props.options?.editorHeight !== undefined
								? props.options.editorHeight
								: 300,
						}}
						className={cn(expand && "max-w-full")}
						// extensions={[autocompletion()]}
						// extensionsKeymap={[completionKeymap]}
					/>
				</div>
				<div
					className={cn(
						"flex flex-col bg-black h-full border-border",

						expand ? "w-1/2 shrink border-r-2 border-b-2" : "w-full"
					)}
				>
					{props.options.showConsole && (
						<Tabs
							className={cn(
								"[&>*]:py-1 border-b-2 border-border gap-3"
							)}
							layoutId={`tabs-${props.persistanceKey}`}
						>
							<TabChildren
								active={previewOrConsole === "preview"}
							>
								<Button
									onClick={() =>
										setPreviewOrConsole("preview")
									}
									variant={"ghost"}
									className="hover:bg-transparent py-1 text-sm h-fit font-normal"
								>
									Preview
								</Button>
							</TabChildren>
							<TabChildren
								active={previewOrConsole === "console"}
							>
								<Button
									onClick={() =>
										setPreviewOrConsole("console")
									}
									variant={"ghost"}
									className="hover:bg-transparent py-1 text-sm h-fit font-normal"
								>
									Console
								</Button>
							</TabChildren>
						</Tabs>
					)}
					<div
						className={cn(
							"border-border grow w-full p-2 flex flex-col "
						)}
					>
						<SandpackPreview
							className={cn(
								"!relative top-0 left-0 ",
								previewOrConsole === "preview"
									? "flex"
									: "!hidden"
							)}
							{...props.options}
							style={{
								height: !expand
									? props.options.previewHeight
									: "100%",
							}}
						/>
						{props.options.showConsole && (
							<SandpackConsole
								className={cn(
									"!relative top-0 left-0",
									previewOrConsole === "console"
										? "flex"
										: "!hidden"
								)}
								{...props.options}
								style={{
									height: !expand
										? props.options.previewHeight || 200
										: "100%",
								}}
								// standalone={true}
							/>
						)}
					</div>
				</div>
			</div>
		</SandpackProvider>
	);
}

export default CustomSandpack;
