import { z } from "zod";

export const sandboxConfigSchema = z.object({
    template: z.enum([
        "static",
        "angular",
        "react",
        "solid",
        "svelte",
        "vanilla",
        "vue",
        "node",
        "nextjs",
        "vite",
        "vite-react",
        "vite-vue",
        "vite-svelte",
        "astro",
        "test-ts"
    ]),
    files: z.record(z.string()).optional(),
    theme: z
        .enum([
            "auto",
            "dark",
            "light",
            "amethyst",
            "aquaBlue",
            "atomDark",
            "cobalt2",
            "cyberpunk",
            "dracula",
            "ecoLight",
            "freeCodeCampDark",
            "githubLight",
            "gruvboxDark",
            "gruvboxLight",
            "levelUp",
            "monokaiPro",
            "neoCyan",
            "nightOwl",
            "sandpackDark",
        ])
        .default("dark")
        .optional(),
    options: z
        .object({
            showNavigator: z.boolean().optional(),
            showTabs: z.boolean().optional(),
            showLineNumbers: z.boolean().optional(), // default - true
            showInlineErrors: z.boolean().optional(), // default - false
            wrapContent: z.boolean().optional(), // default - false
            editorHeight: z.number().optional(), // default - 300
            previewHeight: z.number().optional(),
            editorWidthPercentage: z.number().optional(), // default - 50
            autorun: z.boolean().optional(),
            showConsole: z.boolean().optional(),
            showFilesInExpandedMode: z.boolean().optional(),
        })
});

export type SandpackConfigType = z.infer<typeof sandboxConfigSchema>;

export const defaultSandpackProps: SandpackConfigType = {
    template: "static",
    options: {
        editorHeight: 300,
        showConsole: true,
        previewHeight: 200,
        showLineNumbers: true,
        showNavigator: false,
        showFilesInExpandedMode: true,
        showTabs: true

    },
    theme: "dark",
    files: {}
};