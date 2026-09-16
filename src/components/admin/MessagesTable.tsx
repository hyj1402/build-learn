"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { deleteMessages, markMessagesRead } from "@/app/admin/messages/actions";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { AdminDialog } from "@/components/admin/AdminDialog";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

/**
 * 문의 목록의 선택·읽음 처리·CSV 내려받기를 담당하는 Client Component입니다.
 * 체크 상태와 모달 열림은 브라우저에서 즉시 반응해야 하므로, 목록 조회만 하는 Server Component와 분리합니다.
 */
export function MessagesTable({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMessageId, setOpenMessageId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialogTitleId = useId();
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const openMessage = messages.find((message) => message.id === openMessageId) ?? null;
  const unreadCount = messages.filter((message) => !message.is_read).length;
  const allSelected = messages.length > 0 && selectedIds.length === messages.length;

  /** 선택한 문의 id만 읽음으로 바꾸고, 성공 시 화면의 상태도 바로 갱신합니다. */
  function readMessages(ids: string[]) {
    if (ids.length === 0) return;
    startTransition(async () => {
      await markMessagesRead(ids);
      setMessages((current) =>
        current.map((message) =>
          ids.includes(message.id) ? { ...message, is_read: true } : message,
        ),
      );
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    });
  }

  /** 선택한 문의 id를 삭제하고, 성공 시 화면의 목록·선택 상태에서도 바로 뺍니다. */
  function removeMessages(ids: string[]) {
    if (ids.length === 0) return;
    return deleteMessages(ids).then(() => {
      setMessages((current) => current.filter((message) => !ids.includes(message.id)));
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    });
  }

  /** 메시지를 여는 행위 자체를 확인으로 간주해, 아직 읽지 않은 문의만 자동 읽음 처리합니다. */
  function showMessage(message: Message) {
    setOpenMessageId(message.id);
    if (!message.is_read) readMessages([message.id]);
  }

  /** 선택 체크박스 하나의 값을 더하거나 뺍니다. */
  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  /** Excel에서 수식으로 오해할 수 있는 문자열 앞에 작은따옴표를 넣어, 문의 내용을 안전한 일반 텍스트로 저장합니다. */
  function toSafeExcelText(value: string | boolean) {
    const raw = String(value);
    return /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  }

  /**
   * 현재 화면의 문의 목록을 실제 .xlsx 파일로 만듭니다.
   * 파일 생성은 브라우저에서만 실행하므로, 문의 내용이 별도 서버로 다시 전송되지는 않습니다.
   */
  async function downloadExcel() {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // 필요한 순간에만 Excel 라이브러리를 불러와 평소 관리자 화면의 초기 로딩 부담을 줄입니다.
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "BUILD & LEARN";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("문의 수신함", {
        properties: { defaultRowHeight: 24 },
        views: [{ state: "frozen", ySplit: 1 }],
      });

      worksheet.columns = [
        { header: "이름", key: "name", width: 18 },
        { header: "이메일", key: "email", width: 30 },
        { header: "문의 내용", key: "message", width: 58 },
        { header: "수신일", key: "createdAt", width: 23 },
        { header: "상태", key: "status", width: 14 },
      ];

      messages.forEach((message) => {
        const row = worksheet.addRow({
          name: toSafeExcelText(message.name),
          email: toSafeExcelText(message.email),
          message: toSafeExcelText(message.message),
          createdAt: new Date(message.created_at).toLocaleString("ko-KR"),
          status: message.is_read ? "읽음" : "새 문의",
        });

        row.height = Math.max(30, Math.min(84, Math.ceil(message.message.length / 55) * 22));
        row.eachCell((cell) => {
          cell.alignment = { vertical: "top", wrapText: true };
          cell.border = {
            bottom: { style: "thin", color: { argb: "FFE8E2D8" } },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: row.number % 2 === 0 ? "FFFFFCF7" : "FFFFFFFF" },
          };
        });

        const statusCell = row.getCell("status");
        statusCell.alignment = { horizontal: "center", vertical: "middle" };
        statusCell.font = {
          bold: true,
          color: { argb: message.is_read ? "FF4B6355" : "FFC74B14" },
        };
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: message.is_read ? "FFEAF5EE" : "FFFFEEE6" },
        };
      });

      const headerRow = worksheet.getRow(1);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF4D00" } };
        cell.border = {
          bottom: { style: "medium", color: { argb: "FFE44300" } },
        };
      });

      // Excel에서 각 열을 바로 정렬·필터링할 수 있고, 스크롤해도 제목 행은 유지됩니다.
      worksheet.autoFilter = { from: "A1", to: `E${Math.max(1, worksheet.rowCount)}` };

      const data = await workbook.xlsx.writeBuffer();
      const url = URL.createObjectURL(
        new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `build-learn-contact-${new Date().toISOString().slice(0, 10)}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("문의 Excel 파일 생성 실패", error);
      setDownloadError("Excel 파일을 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <div className="admin-list-toolbar">
        <p aria-live="polite">
          읽지 않은 문의 <strong>{unreadCount}</strong>건 · 선택{" "}
          <strong>{selectedIds.length}</strong>건
        </p>
        <div className="admin-list-toolbar-actions">
          <button
            type="button"
            className="admin-action-button admin-action-outline-blue admin-list-action-button"
            onClick={() => readMessages(selectedIds)}
            disabled={selectedIds.length === 0 || isPending}
          >
            {isPending ? "처리 중..." : "선택 항목 읽음 처리"}
          </button>
          <AdminConfirmButton
            label="선택 항목 삭제"
            triggerClassName="admin-action-button admin-action-outline-danger admin-list-action-button"
            confirmTitle="선택한 문의를 삭제할까요?"
            confirmDescription={`선택한 ${selectedIds.length}건이 완전히 삭제되며, 되돌릴 수 없습니다.`}
            onConfirm={() => removeMessages(selectedIds)}
            disabled={selectedIds.length === 0}
          />
          <button
            type="button"
            className="admin-action-button admin-action-outline admin-list-action-button"
            onClick={downloadExcel}
            disabled={messages.length === 0 || isDownloading}
          >
            {isDownloading ? "Excel 파일 만드는 중..." : "Excel 다운로드"}
          </button>
        </div>
      </div>
      {downloadError && (
        <p className="admin-form-error" role="alert">
          {downloadError}
        </p>
      )}
      <div className="admin-table-wrap admin-table-wrap-soft">
        <table className="admin-table admin-table-soft admin-messages-table">
          <caption className="sr-only">문의 수신함 목록</caption>
          <thead>
            <tr>
              <th scope="col" className="admin-select-cell">
                <input
                  aria-label="문의 전체 선택"
                  checked={allSelected}
                  onChange={() =>
                    setSelectedIds(allSelected ? [] : messages.map((message) => message.id))
                  }
                  type="checkbox"
                />
              </th>
              <th scope="col">보낸 사람</th>
              <th scope="col">메시지</th>
              <th scope="col">받은 날짜</th>
              <th scope="col">상태</th>
              <th scope="col">
                <span className="sr-only">작업</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr className={message.is_read ? "" : "is-unread"} key={message.id}>
                <td className="admin-select-cell">
                  <input
                    aria-label={`${message.name}님의 문의 선택`}
                    checked={selectedSet.has(message.id)}
                    onChange={() => toggleSelection(message.id)}
                    type="checkbox"
                  />
                </td>
                <td>
                  <strong className="admin-table-title">{message.name}</strong>
                  <a className="admin-table-description" href={`mailto:${message.email}`}>
                    {message.email}
                  </a>
                </td>
                <td>
                  <button
                    className="admin-message-preview"
                    onClick={() => showMessage(message)}
                    type="button"
                  >
                    {message.message.length > 56
                      ? `${message.message.slice(0, 56)}…`
                      : message.message}
                  </button>
                </td>
                <td className="admin-date">
                  {new Date(message.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td>
                  <span
                    className={`admin-status ${message.is_read ? "admin-status-read" : "admin-status-unread"}`}
                  >
                    {message.is_read ? "읽음" : "새 문의"}
                  </span>
                </td>
                <td className="admin-row-actions-cell">
                  <div className="admin-row-actions">
                    <button
                      className="admin-action-button admin-action-outline-blue admin-row-action-button"
                      disabled={message.is_read || isPending}
                      onClick={() => readMessages([message.id])}
                      type="button"
                    >
                      {message.is_read ? "읽음 완료" : "읽음 처리"}
                    </button>
                    <AdminConfirmButton
                      confirmDescription={`${message.name}님이 보낸 문의가 완전히 삭제되며, 되돌릴 수 없습니다.`}
                      confirmTitle="이 문의를 삭제할까요?"
                      onConfirm={() => removeMessages([message.id])}
                      triggerClassName="admin-action-button admin-action-outline-danger admin-row-action-button"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td className="admin-empty-cell" colSpan={6}>
                  아직 받은 문의가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminDialog
        onClose={() => setOpenMessageId(null)}
        open={openMessage !== null}
        title={openMessage ? `${openMessage.name}님의 문의` : "문의"}
        titleId={dialogTitleId}
      >
        <div className="admin-dialog-content admin-message-dialog-content">
          {openMessage?.message}
        </div>
      </AdminDialog>
    </>
  );
}
