import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// 모든 MDX 원본이 들어 있는 기준 폴더입니다. process.cwd()는 프로젝트 루트를 뜻합니다.
const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

/**
 * 지정한 콘텐츠 폴더의 모든 MDX 파일을 읽습니다.
 * gray-matter는 위쪽의 frontmatter(제목, 날짜 등)와 실제 본문을 분리합니다.
 * 이 함수는 Node.js의 파일 시스템을 사용하므로 브라우저가 아닌 서버에서만 실행됩니다.
 */
export function readContentFiles(folder: "projects" | "logs") {
  const dir = path.join(CONTENT_ROOT, folder);
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => {
      // 파일 이름에서 확장자를 뺀 값이 상세 페이지 주소(slug)가 됩니다.
      const slug = name.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      const parsed = matter(raw);

      return { slug, data: parsed.data, content: parsed.content };
    });
}

/** slug가 일치하는 콘텐츠 하나를 찾습니다. 없으면 undefined를 반환합니다. */
export function readContentFile(folder: "projects" | "logs", slug: string) {
  return readContentFiles(folder).find((item) => item.slug === slug);
}
