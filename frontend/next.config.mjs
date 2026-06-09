import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this app (a parent lockfile would otherwise be inferred).
  outputFileTracingRoot: __dirname,
  // Product images are loaded with plain <img> tags, so no image domain config is needed.
};

export default nextConfig;
