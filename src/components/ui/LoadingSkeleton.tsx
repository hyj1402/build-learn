type SkeletonBlockProps = {
  className?: string;
};

/**
 * 실제 데이터가 도착하기 전, 화면의 자리와 정보 밀도를 먼저 보여주는 공통 블록입니다.
 * CSS 애니메이션만 사용하므로 JavaScript를 기다리지 않고 Server Component에서도 바로 렌더링됩니다.
 */
export function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return <span aria-hidden="true" className={`loading-skeleton-block ${className}`} />;
}

/** 공개 사이트의 목록·상세 페이지 전환에 쓰는 공통 스켈레톤입니다. */
export function PublicPageLoadingSkeleton() {
  return (
    <main className="container loading-page" aria-busy="true" aria-live="polite">
      <p className="loading-skeleton-message">콘텐츠를 불러오는 중입니다.</p>
      <div className="loading-page-heading">
        <SkeletonBlock className="loading-skeleton-eyebrow" />
        <SkeletonBlock className="loading-skeleton-title" />
        <SkeletonBlock className="loading-skeleton-summary" />
      </div>
      <div className="loading-card-grid">
        {Array.from({ length: 3 }, (_, index) => (
          <article className="loading-content-card" key={index}>
            <SkeletonBlock className="loading-skeleton-image" />
            <SkeletonBlock className="loading-skeleton-label" />
            <SkeletonBlock className="loading-skeleton-card-title" />
            <SkeletonBlock className="loading-skeleton-copy" />
            <SkeletonBlock className="loading-skeleton-copy loading-skeleton-copy-short" />
          </article>
        ))}
      </div>
    </main>
  );
}

/** 관리자 목록이 DB 결과를 기다릴 때, 검색·표 구조를 유지해 화면 전환 맥락을 보존합니다. */
export function AdminListLoadingSkeleton() {
  return (
    <section className="admin-loading-page" aria-busy="true" aria-live="polite">
      <p className="loading-skeleton-message">관리자 데이터를 불러오는 중입니다.</p>
      <div className="admin-loading-heading">
        <SkeletonBlock className="loading-skeleton-admin-title" />
        <SkeletonBlock className="loading-skeleton-admin-action" />
      </div>
      <div className="admin-loading-filter">
        <SkeletonBlock />
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
      <div className="admin-loading-table" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="admin-loading-row" key={index}>
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
        ))}
      </div>
    </section>
  );
}
