/**
 * Vercel serverless entry point for the API.
 *
 * Vercel turns every file under /api into a function, and vercel.json rewrites
 * all /api/* traffic here. The Express app handles its own routing from there,
 * so this stays a single re-export.
 *
 * It imports the COMPILED output (server/dist) rather than server/src, so that
 * Vercel's bundler only ever follows plain JavaScript imports — no TypeScript
 * resolution or path-alias handling required from the platform. The build
 * command in vercel.json compiles the server before this is bundled.
 *
 * app.ts exports the Express app without calling listen(), which is exactly the
 * handler signature (req, res) that Vercel's Node runtime expects.
 */
export { default } from '../server/dist/app.js';
