import { deleteStorageFile } from "@/app/admin/storage/actions";
import { LARGE_FILE_BYTES, STORAGE_WARNING_BYTES, getStorageOverview } from "@/lib/storage-admin";

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))}KB`;
  return `${(value / (1024 * 1024)).toFixed(2)}MB`;
}

/** content-images 버킷의 사용량·큰 파일·참조되지 않는 파일을 확인하는 관리자 화면입니다. */
export default async function AdminStoragePage() {
  const { files, totalBytes, unusedFiles } = await getStorageOverview();
  const isWarning = totalBytes >= STORAGE_WARNING_BYTES;
  const largeFiles = files.filter((file) => file.size >= LARGE_FILE_BYTES);

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

      <StorageTable
        files={largeFiles}
        title="큰 파일"
        emptyMessage="500KB 이상인 파일이 없습니다."
      />
      <StorageTable
        files={unusedFiles}
        title="미사용 파일"
        emptyMessage="현재 확인된 미사용 파일이 없습니다."
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
