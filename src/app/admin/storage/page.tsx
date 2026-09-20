import { deleteStorageFile } from "@/app/admin/storage/actions";
import Link from "next/link";
import { LogDateRangePicker } from "@/components/admin/LogDateRangePicker";
import { LARGE_FILE_BYTES, STORAGE_WARNING_BYTES, getStorageOverview } from "@/lib/storage-admin";

const SORT_OPTIONS = ["size_desc", "size_asc", "newest", "oldest", "path"] as const;

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))}KB`;
  return `${(value / (1024 * 1024)).toFixed(2)}MB`;
}
function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}
function dateParam(value: string | string[] | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

/** content-images 버킷의 사용량·큰 파일·참조되지 않는 파일을 확인하는 관리자 화면입니다. */
export default async function AdminStoragePage({ searchParams }: PageProps<"/admin/storage">) {
  const values = await searchParams;
  const query = stringParam(values.q).toLocaleLowerCase("ko-KR");
  const selectedUsage = stringParam(values.usage);
  const usage = ["used", "unused"].includes(selectedUsage) ? selectedUsage : "";
  const dateFrom = dateParam(values.from);
  const dateTo = dateParam(values.to);
  const selectedSort = stringParam(values.sort);
  const sort = SORT_OPTIONS.includes(selectedSort as (typeof SORT_OPTIONS)[number])
    ? selectedSort
    : "size_desc";
  const { files, totalBytes, unusedFiles } = await getStorageOverview();
  const isWarning = totalBytes >= STORAGE_WARNING_BYTES;
  // 파일 경로·사용 여부·업로드 시점을 함께 비교해 두 목록(큰 파일/미사용 파일)에 같은 조건을 적용합니다.
  const filteredFiles = files.filter((file) => {
    const createdDate = file.createdAt?.slice(0, 10);
    return (
      (!query || file.path.toLocaleLowerCase("ko-KR").includes(query)) &&
      (!usage || (usage === "used" ? file.isUsed : !file.isUsed)) &&
      (!dateFrom || (createdDate && createdDate >= dateFrom)) &&
      (!dateTo || (createdDate && createdDate <= dateTo))
    );
  });
  const sortedFiles = [...filteredFiles].sort((left, right) => {
    if (sort === "size_asc") return left.size - right.size;
    if (sort === "newest") return (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
    if (sort === "oldest") return (left.createdAt ?? "").localeCompare(right.createdAt ?? "");
    if (sort === "path") return left.path.localeCompare(right.path, "ko-KR");
    return right.size - left.size;
  });
  const largeFiles = sortedFiles.filter((file) => file.size >= LARGE_FILE_BYTES);
  const filteredUnusedFiles = sortedFiles.filter((file) => !file.isUsed);

  return (
    <div className="admin-list-page admin-storage-page">
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">OPERATIONS / STORAGE</p>
          <h1>파일 관리</h1>
          <p>이미지 용량과 콘텐츠에 연결되지 않은 파일을 안전하게 관리합니다.</p>
        </div>
      </header>

      <dl className={`admin-storage-summary ${isWarning ? "is-warning" : ""}`}>
        <div>
          <dt>현재 사용량</dt>
          <dd>{formatBytes(totalBytes)}</dd>
          <small>경고 기준: 700MB</small>
        </div>
        <div>
          <dt>전체 파일</dt>
          <dd>{files.length}</dd>
          <small>대표 이미지와 본문 이미지</small>
        </div>
        <div>
          <dt>미사용 파일</dt>
          <dd>{unusedFiles.length}</dd>
          <small>삭제 전 목록에서 한 번 더 확인하세요.</small>
        </div>
      </dl>
      {isWarning ? (
        <p className="admin-storage-warning">
          Storage가 700MB를 넘었습니다. 미사용 파일을 검토해주세요.
        </p>
      ) : null}

      <form action="/admin/storage" className="admin-list-filter">
        <label className="admin-list-filter-query">
          <span>파일 경로 검색</span>
          <input defaultValue={query} name="q" placeholder="예: projects/portfolio" type="search" />
        </label>
        <label>
          <span>사용 여부</span>
          <select defaultValue={usage} name="usage">
            <option value="">전체</option>
            <option value="used">사용 중</option>
            <option value="unused">미사용</option>
          </select>
        </label>
        <label className="admin-list-filter-date">
          <span>업로드일</span>
          <LogDateRangePicker from={dateFrom} to={dateTo} />
        </label>
        <label>
          <span>정렬</span>
          <select defaultValue={sort} name="sort">
            <option value="size_desc">용량 큰순</option>
            <option value="size_asc">용량 작은순</option>
            <option value="newest">업로드일 최신순</option>
            <option value="oldest">업로드일 오래된순</option>
            <option value="path">경로 가나다순</option>
          </select>
        </label>
        <div className="admin-list-filter-actions">
          <button className="admin-action-button" type="submit">
            검색
          </button>
          <Link className="admin-action-button admin-action-outline" href="/admin/storage">
            초기화
          </Link>
        </div>
      </form>
      <p className="admin-list-filter-result" aria-live="polite">
        조건에 맞는 파일 <strong>{filteredFiles.length}개</strong>
      </p>

      <StorageTable
        files={largeFiles}
        title="큰 파일"
        emptyMessage="500KB 이상인 파일이 없습니다."
      />
      <StorageTable
        files={filteredUnusedFiles}
        title="미사용 파일"
        emptyMessage={
          unusedFiles.length
            ? "조건에 맞는 미사용 파일이 없습니다."
            : "현재 확인된 미사용 파일이 없습니다."
        }
      />
    </div>
  );
}

function StorageTable({
  emptyMessage,
  files,
  title,
}: {
  emptyMessage: string;
  files: Awaited<ReturnType<typeof getStorageOverview>>["files"];
  title: string;
}) {
  return (
    <section className="admin-storage-section">
      <h2>{title}</h2>
      {files.length === 0 ? (
        <p className="admin-storage-empty">{emptyMessage}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>경로</th>
                <th>용량</th>
                <th>사용 여부</th>
                <th aria-label="파일 삭제" />
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.path}>
                  <td>
                    <code>{file.path}</code>
                  </td>
                  <td>{formatBytes(file.size)}</td>
                  <td>{file.isUsed ? "사용 중" : "미사용"}</td>
                  <td>
                    {file.isUsed ? (
                      <span className="admin-storage-connected">연결됨</span>
                    ) : (
                      <form action={deleteStorageFile.bind(null, file.path)}>
                        <button className="admin-table-delete" type="submit">
                          삭제
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
