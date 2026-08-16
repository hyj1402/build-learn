import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
const CONTENT_ROOT = path.join(process.cwd(), "src", "content");
export function readContentFiles(folder: "projects" | "logs") {
  const dir = path.join(CONTENT_ROOT, folder);
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => {
      const slug = name.replace(/\.mdx$/, ""),
        raw = fs.readFileSync(path.join(dir, name), "utf8"),
        parsed = matter(raw);
      return { slug, data: parsed.data, content: parsed.content };
    });
}
export function readContentFile(folder: "projects" | "logs", slug: string) {
  return readContentFiles(folder).find((item) => item.slug === slug);
}
