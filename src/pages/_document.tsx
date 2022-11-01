import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
	return (
		<Html>
			<Head />

			<link
				rel="stylesheet"
				href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css"
				integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq"
				crossOrigin="anonymous"
			></link>
			<script
				src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML"
				id=""
			>
				{" "}
			</script>
			<script
				defer
				src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js"
				integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz"
				crossOrigin="anonymous"
			></script>
			<script
				defer
				src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js"
				integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI"
				crossOrigin="anonymous"
			></script>

			<body className="bg-slate-900 ">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
