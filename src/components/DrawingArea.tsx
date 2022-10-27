import { useRouter } from "next/router";
import React, {
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { FaEraser, FaPencilAlt } from "react-icons/fa";
import { CANVAS_LIMIT, SUPABASE_IMAGE_BUCKET } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import { CanvasImageContext } from "../pages/_app";

const cursor_style = {
	pen: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:20px;'><text y='50%'>✍️</text></svg>\") 0 20, pointer",
	eraser: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:20px;'><text y='50%'>🧼</text></svg>\") 15 17, pointer",
};

let prevX = 0;
let prevY = 0;

function DrawingArea({
	fileName,
	imageFolder,
}: {
	fileName?: string;
	imageFolder?: string;
}) {
	const router = useRouter();
	const drawingArea = useRef<HTMLCanvasElement | null>(null);
	const [coords, setCoords] =
		useState<Record<"left" | "top" | "width" | "height", number>>();
	const [cwidth, setCwidth] = useState(0);
	const [cheight, setCheight] = useState(0);
	const [tool, setTool] = useState<keyof typeof cursor_style>("pen");
	const [color, setColor] = useState<string>("#000");
	const [penSize, setPenSize] = useState(15);
	const [eraserSize, setEraserSize] = useState(30);
	const [saved, setSaved] = useState(false);

	const { canvasImages, setCanvasImages } = useContext(CanvasImageContext);

	useEffect(() => {
		let canvas = drawingArea.current;
		if (!canvas) return;
		let { left, top, width, height } = canvas.getBoundingClientRect();
		if (fileName && imageFolder) {
			drawImage(canvas);
		}
		setCoords({ left, top, width, height });
		setCwidth(canvas.width);
		setCheight(canvas.height);
	}, []);

	const drawImage = async (canvas: HTMLCanvasElement) => {
		let { width, height } = canvas.getBoundingClientRect();
		let context = canvas.getContext("2d");
		const { data } = await supabase.storage
			.from(SUPABASE_IMAGE_BUCKET)
			.download(`${imageFolder}/${fileName}.png`);

		if (data) {
			const blobString = await data.text();

			let image = new Image(width, height);

			image.src = blobString;
			image.onload = () => context?.drawImage(image, 0, 0);
		}
	};

	const calculatePos = ({
		e,
		coords,
		cwidth,
		cheight,
	}: {
		e: any;
		coords: Record<"left" | "top" | "width" | "height", number> | undefined;
		cwidth: number;
		cheight: number;
	}): { x: number; y: number } => {
		let x, y;
		if (!coords) return { x: 0, y: 0 };
		let { left, top, width, height } = coords;
		// let top = 0;
		// let width = 750;
		// let height = 500;
		// let touch = { clientX: 0, clientY: 0 };
		// if (e.changedTouches) touch = e.changedTouches[0];
		// let clientX = e.clientX || touch.clientX;
		let clientX = e.clientX;
		// let clientY = e.clientY || touch.clientY;
		let clientY = e.clientY;
		x = (clientX - left) * (cwidth / width);
		y = (clientY - top) * (cheight / height);
		return { x, y };
	};

	const onMouseDown = (e: any) => {
		if (!router.asPath.startsWith("/edit")) return;
		e.stopPropagation();
		e.preventDefault();
		if (saved) setSaved(false);
		if (!coords) return;
		let top = drawingArea.current?.getBoundingClientRect().top || 0;
		let { x, y } = calculatePos({
			e,
			coords: { ...coords, top },
			cwidth,
			cheight,
		});
		if (x === prevX && y === prevY) return;
		prevX = x;
		prevY = y;
		let context = drawingArea.current?.getContext("2d");

		if (!context) return;

		if (tool === "eraser") {
			context.strokeStyle = "white";
			context.lineWidth = eraserSize * 2;
			// context.lineWidth = 5;
			context.lineCap = "round";
			context.moveTo(x, y);
			context.beginPath();
		} else {
			context.strokeStyle = color;
			context.lineWidth = penSize;
			context.lineCap = "round";
			context.moveTo(x, y);
			context.beginPath();
		}

		let mouseMoveFunc = setMouseMove(top);

		drawingArea.current?.addEventListener("pointermove", mouseMoveFunc);
		drawingArea.current?.addEventListener("pointerup", () =>
			drawingArea.current?.removeEventListener(
				"pointermove",
				mouseMoveFunc
			)
		);
		return;
	};

	const setMouseMove = (top: number) => {
		let prevX = 0;
		let prevY = 0;

		const mouseMoveFunc = (e: any) => {
			let context = drawingArea.current?.getContext("2d");
			if (!context) return;
			if (e.buttons === 0) {
				context?.closePath();
				return;
			}
			if (!coords) return;
			let { x, y } = calculatePos({
				e,
				coords: { ...coords, top },
				cwidth,
				cheight,
			});
			if (x === prevX && y === prevY) return;
			prevX = x;
			prevY = y;
			if (tool === "pen") {
				// context.beginPath();
				context?.lineTo(x, y);
				context?.stroke();
			} else if (tool === "eraser") {
				context?.lineTo(x, y);
				context?.stroke();
			}
		};
		return mouseMoveFunc;
	};

	const onSave = async () => {
		let canvas = drawingArea.current;
		if (!canvas) return;
		if (fileName && canvasImages.length < CANVAS_LIMIT) {
			let file = new File([canvas.toDataURL()], `${fileName}.png`);
			setCanvasImages((prev) => {
				if (prev.length < CANVAS_LIMIT) return [...prev, file];
				return prev;
			});

			setSaved(true);
		}
	};

	return (
		<div className="w-full">
			<div className="" id={fileName}>
				<canvas
					ref={drawingArea}
					className={` border-4 w-full aspect-[4/3] border-black bg-white 
				`}
					style={{
						cursor: cursor_style[tool],
						touchAction: "none",
					}}
					onPointerDown={onMouseDown}
					width={1440}
					height={1080}
				></canvas>
			</div>
			{router.asPath.startsWith("/edit") && (
				<div className="flex items-center gap-2 justify-center flex-wrap">
					<div
						className={` btn btn-xs md:btn-sm normal-case ${
							saved ? "text-lime-400" : "text-white"
						}`}
						onClick={onSave}
					>
						{saved ? "Saved" : "Save"}
					</div>
					<ToolSelect {...{ tool, setTool }} />
					{tool === "pen" ? (
						<input
							type="range"
							name=""
							id=""
							className=""
							min={5}
							max={50}
							step={5}
							value={penSize}
							onChange={(e) =>
								setPenSize(parseInt(e.target.value))
							}
						/>
					) : (
						<input
							type="range"
							name=""
							id=""
							className=""
							min={10}
							max={100}
							step={10}
							value={eraserSize}
							onChange={(e) =>
								setEraserSize(parseInt(e.target.value))
							}
						/>
					)}
					<ColorSelect {...{ color, setColor }} />
				</div>
			)}
		</div>
	);
}

function ToolSelect({
	tool,
	setTool,
}: {
	tool: keyof typeof cursor_style;
	setTool: Dispatch<SetStateAction<keyof typeof cursor_style>>;
}) {
	return (
		<div className="flex gap-2 items-center">
			{/* <span className="font-bold">Tool:</span> */}
			<button
				className={`btn md:btn-sm btn-xs ${
					tool === "pen" ? "text-lime-400" : ""
				}`}
				onClick={() => setTool("pen")}
			>
				<FaPencilAlt />
			</button>
			<button
				className={`btn md:btn-sm btn-xs ${
					tool === "eraser" ? "text-lime-400" : ""
				}`}
				onClick={() => setTool("eraser")}
			>
				<FaEraser />
			</button>

			{/* <div className="btn btn-sm custom">Clear</div> */}
		</div>
	);
}

function ColorSelect({
	color,
	setColor,
}: {
	color: string;
	setColor: Dispatch<SetStateAction<string>>;
}) {
	return (
		<>
			<input
				type="color"
				name=""
				id="color"
				className=""
				onChange={(e) => setColor(e.target.value)}
				value={color}
			/>
		</>
	);
}

export default DrawingArea;
