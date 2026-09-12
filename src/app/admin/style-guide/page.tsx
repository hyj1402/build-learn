import type { Metadata } from "next";

import { AdminAlertDialog } from "@/components/admin/AdminAlertDialog";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { AdminViewDialog } from "@/components/admin/AdminViewDialog";
export const metadata: Metadata = { title: "관리자 스타일 가이드" };
/** 관리자 화면이 공유해야 하는 기본 UI 부품을 한곳에서 미리 확인하는 페이지입니다. */
export default function AdminStyleGuidePage() {
  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">ADMIN / FOUNDATION</p>
          <h1>스타일 가이드</h1>
          <p>따뜻한 배경과 주황 포인트를 사용한, 너무 딱딱하지 않은 입력 규칙입니다.</p>
        </div>
      </header>
      <div className="admin-style-grid">
        <section className="admin-form">
          <div>
            <h2>부드러운 입력 요소</h2>
            <p>라운드 처리와 은은한 그림자로 작성 흐름을 편안하게 만듭니다.</p>
          </div>
          <div className="admin-form-row">
            <div className="admin-field">
              <label>텍스트 입력</label>
              <input placeholder="입력하세요" />
            </div>
            <div className="admin-field">
              <label>Select</label>
              <AdminSelect
                ariaLabel="스타일 가이드 선택 예시"
                defaultValue="published"
                name="style-guide-select"
                options={[
                  { value: "draft", label: "임시저장" },
                  { value: "published", label: "공개" },
                ]}
              />
            </div>
          </div>
          <label className="admin-checkbox">
            <input type="checkbox" defaultChecked /> 대표 항목으로 표시
          </label>
          <fieldset className="admin-radio-group">
            <legend>작성 공개 범위</legend>
            <div className="admin-radio-options">
              <label className="admin-radio">
                <input defaultChecked name="style-guide-visibility" type="radio" /> 공개
              </label>
              <label className="admin-radio">
                <input name="style-guide-visibility" type="radio" /> 비공개
              </label>
              <label className="admin-radio">
                <input name="style-guide-visibility" type="radio" /> 임시 저장
              </label>
            </div>
          </fieldset>
          <div className="admin-field">
            <label>여러 줄 입력</label>
            <textarea rows={5} placeholder="내용을 입력하세요" />
          </div>
          <button className="admin-primary-action">저장하기</button>
        </section>
        <section className="admin-style-section">
          <h2>버튼</h2>
          <p className="admin-style-description">
            색상은 작업의 성격을 나타내고, 채운 버튼은 결정적인 작업에만 사용합니다.
          </p>
          <div className="admin-button-examples">
            <div>
              <h3>채운 버튼 · 저장과 발행</h3>
              <div className="admin-button-row">
                <button className="admin-primary-action" type="button">
                  저장하기
                </button>
                <button className="admin-action-button admin-action-publish" type="button">
                  공개 발행
                </button>
                <button className="admin-action-button admin-action-draft" type="button">
                  임시 저장
                </button>
                <button className="admin-action-button admin-action-violet" type="button">
                  검토 요청
                </button>
              </div>
            </div>
            <div>
              <h3>테두리 버튼 · 보조 작업</h3>
              <div className="admin-button-row">
                <button className="admin-action-button admin-action-outline" type="button">
                  미리보기
                </button>
                <button className="admin-action-button admin-action-outline-blue" type="button">
                  복사하기
                </button>
                <button className="admin-action-button admin-action-outline-danger" type="button">
                  삭제하기
                </button>
                <button className="admin-action-button admin-action-outline-violet" type="button">
                  보관하기
                </button>
              </div>
            </div>
            <div>
              <h3>텍스트 버튼 · 화면 이동</h3>
              <div className="admin-button-row">
                <button className="admin-action-button admin-action-ghost" type="button">
                  목록으로
                </button>
                <button className="admin-action-button admin-action-ghost-danger" type="button">
                  작성 취소
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="admin-style-section admin-style-table-section">
          <div className="admin-table-guide-heading">
            <div>
              <p className="eyebrow">CONTENT LIST</p>
              <h2>테이블</h2>
              <p className="admin-style-description">
                제목을 가장 먼저 읽고, 보조 정보와 작업은 한 단계 뒤로 물러나는 목록입니다.
              </p>
            </div>
            <span className="admin-table-count">총 3개</span>
          </div>
          <div className="admin-table-wrap admin-table-wrap-soft">
            <table className="admin-table admin-table-soft">
              <caption className="sr-only">프로젝트 목록 테이블 예시</caption>
              <thead>
                <tr>
                  <th scope="col">프로젝트</th>
                  <th scope="col">URL</th>
                  <th scope="col">수정일</th>
                  <th scope="col">
                    <span className="sr-only">작업</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong className="admin-table-title">BUILD &amp; LEARN</strong>
                    <span className="admin-table-description">개인 개발 아카이브</span>
                  </td>
                  <td>
                    <code>build-learn</code>
                  </td>
                  <td className="admin-date">2026. 09. 12.</td>
                  <td className="admin-row-actions">
                    <button className="admin-table-action" type="button">
                      수정 <span aria-hidden="true">→</span>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong className="admin-table-title">삼성꿈장학재단 시스템 개발</strong>
                    <span className="admin-table-description">장학사업 운영 지원 시스템</span>
                  </td>
                  <td>
                    <code>samsung-dream-scholarship</code>
                  </td>
                  <td className="admin-date">2026. 09. 11.</td>
                  <td className="admin-row-actions">
                    <button className="admin-table-action" type="button">
                      수정 <span aria-hidden="true">→</span>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong className="admin-table-title">학습 기록 관리</strong>
                    <span className="admin-table-description">Supabase와 관리자 화면 구축</span>
                  </td>
                  <td>
                    <code>supabase-admin-log</code>
                  </td>
                  <td className="admin-date">2026. 09. 10.</td>
                  <td className="admin-row-actions">
                    <button className="admin-table-action" type="button">
                      수정 <span aria-hidden="true">→</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section className="admin-style-section">
          <h2>페이지 이동</h2>
          <p className="admin-style-description">
            목록의 현재 위치는 주황색으로, 이동할 수 없는 처음·이전 버튼은 옅은 회색으로 구분합니다.
          </p>
          <nav className="admin-pagination" aria-label="페이지 이동 스타일 예시">
            <span>처음</span>
            <span>이전</span>
            <div className="admin-pagination-numbers">
              <span aria-current="page" className="admin-pagination-number is-current">
                1
              </span>
              <span className="admin-pagination-number">2</span>
              <span className="admin-pagination-number">3</span>
              <span className="admin-pagination-ellipsis">…</span>
              <span className="admin-pagination-number">12</span>
            </div>
            <span>다음</span>
            <span>마지막</span>
          </nav>
        </section>
        <section className="admin-style-section">
          <h2>다이얼로그</h2>
          <p className="admin-style-description">
            알림은 확인 버튼 하나, 확인 창은 되돌릴 수 없는 작업 전에 취소·실행 두 선택지를 줍니다.
          </p>
          <div className="admin-button-row">
            <AdminAlertDialog
              triggerLabel="알림 창 열기"
              triggerClassName="admin-action-button admin-action-outline"
              title="저장되었습니다"
            >
              변경한 내용이 저장되었습니다. 목록에서 바로 확인할 수 있습니다.
            </AdminAlertDialog>
            <AdminConfirmButton
              label="삭제하기 (예시)"
              triggerClassName="admin-action-button admin-action-outline-danger"
              confirmTitle="정말 삭제할까요?"
              confirmDescription="이 작업은 되돌릴 수 없습니다. (스타일 가이드 예시라 실제로 삭제되는 항목은 없습니다.)"
              onConfirm={async () => {
                "use server";
              }}
            />
            <AdminViewDialog title="긴 내용 예시" triggerLabel="자세히 보기 (예시)">
              표나 카드 안에 다 담기 어려운 긴 문의·본문 내용을 여기에 그대로 보여줍니다. 문의
              수신함의 메시지 미리보기를 클릭하면 이 방식으로 전체 내용을 확인할 수 있습니다.
            </AdminViewDialog>
          </div>
        </section>
        <section className="admin-style-section">
          <h2>탭</h2>
          <p className="admin-style-description">
            관련 정보를 구역으로 나눠 보여줄 때 사용합니다. 방향키로도 이동할 수 있습니다.
          </p>
          <AdminTabs
            label="스타일 가이드 탭 예시"
            tabs={[
              {
                id: "overview",
                label: "개요",
                content: <p>탭마다 독립된 내용을 담고, 한 번에 하나만 보여줍니다.</p>,
              },
              {
                id: "usage",
                label: "사용 예",
                content: (
                  <p>
                    글 작성 화면에서 &quot;기본 정보&quot;와 &quot;SEO 설정&quot;을 나눌 때 쓸 수
                    있습니다.
                  </p>
                ),
              },
              {
                id: "a11y",
                label: "접근성",
                content: (
                  <p>
                    <code>role=&quot;tablist&quot;</code>와 방향키 이동을 지원해 키보드만으로도
                    탐색할 수 있습니다.
                  </p>
                ),
              },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
