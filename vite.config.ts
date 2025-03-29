import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/Trivia.IO/",
	build: {
		outDir: "docs",
	},
});
