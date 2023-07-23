"use client";
import { ToastContext } from "@/contexts/ToastProvider";
import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import { VscLoading } from "react-icons/vsc";

function ToastDisplay({ message }: { message: string }) {
	return (
		<AnimatePresence>
			{message && (
				<motion.div
					className={`toast fixed bottom-4 bg-black right-4 text-gray-200 border-[1px] border-gray-100 rounded-sm p-4
			}  z-[500]`}
					initial={{ translateX: "100%" }}
					animate={{ translateX: "0" }}
					exit={{ translateX: "100%" }}
					transition={{ duration: 0.5 }}
				>
					{message}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default ToastDisplay;
