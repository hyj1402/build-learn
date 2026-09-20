"use client";

import { format, parseISO, startOfMonth, startOfToday, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { ko as dayPickerKo } from "react-day-picker/locale";

type DatePreset = { label: string; range: DateRange | undefined };

/** URL의 YYYY-MM-DD 문자열을 브라우저 시간대 기준 날짜로 안전하게 바꿉니다. */
function parseDate(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseISO(value) : undefined;
}

/** DayPicker가 고른 Date를 관리자 목록 URL에 쓰는 YYYY-MM-DD로 바꿉니다. */
function toSearchDate(value?: Date) {
  return value ? format(value, "yyyy-MM-dd") : "";
}

function formatRange(range?: DateRange) {
  if (!range?.from) return "전체 기간";
  const from = format(range.from, "yyyy년 M월 d일", { locale: ko });
  if (!range.to) return `${from}부터 종료일 선택`;
  return `${from} ~ ${format(range.to, "yyyy년 M월 d일", { locale: ko })}`;
}

/**
 * Log 목록의 from/to URL 조건을 한 번에 선택하는 날짜 범위 입력입니다.
 * 페이지는 서버에서 검색하지만, 달력 열기·선택은 브라우저 상호작용이므로 작은 Client Component로 분리합니다.
 */
export function LogDateRangePicker({ from, to }: { from?: string; to?: string }) {
  const initialRange = { from: parseDate(from), to: parseDate(to) };
  const [range, setRange] = useState<DateRange | undefined>(
    initialRange.from ? initialRange : undefined,
  );
  const [month, setMonth] = useState(initialRange.from ?? new Date());
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeWhenClickedOutside(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function closeWhenEscapePressed(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", closeWhenClickedOutside);
    document.addEventListener("keydown", closeWhenEscapePressed);
    return () => {
      document.removeEventListener("mousedown", closeWhenClickedOutside);
      document.removeEventListener("keydown", closeWhenEscapePressed);
    };
  }, []);

  const today = startOfToday();
  const presets: DatePreset[] = [
    { label: "오늘", range: { from: today, to: today } },
    { label: "최근 7일", range: { from: subDays(today, 6), to: today } },
    { label: "이번 달", range: { from: startOfMonth(today), to: today } },
  ];

  function selectRange(nextRange: DateRange | undefined) {
    setRange(nextRange);
    if (nextRange?.from) setMonth(nextRange.from);
  }

  return (
    <div className="admin-date-range-picker" ref={pickerRef}>
      {/* GET 검색 폼은 기존 from/to URL 규칙을 그대로 사용합니다. */}
      <input name="from" type="hidden" value={toSearchDate(range?.from)} />
      <input name="to" type="hidden" value={toSearchDate(range?.to)} />
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="admin-date-range-trigger"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="M7 3v3m10-3v3M4.5 9.5h15M6 5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 6 5Z" />
        </svg>
        <span>{formatRange(range)}</span>
        <span aria-hidden="true" className="admin-date-range-chevron" />
      </button>

      {isOpen && (
        <div aria-label="등록일 범위 선택" className="admin-date-range-popover" role="dialog">
          <DayPicker
            animate
            aria-label="등록일 달력"
            autoFocus
            captionLayout="dropdown"
            defaultMonth={month}
            endMonth={new Date()}
            locale={dayPickerKo}
            mode="range"
            month={month}
            onMonthChange={setMonth}
            onSelect={selectRange}
            selected={range}
            showOutsideDays
            startMonth={new Date(2020, 0)}
          />
          <div className="admin-date-range-presets">
            {presets.map((preset) => (
              <button key={preset.label} onClick={() => selectRange(preset.range)} type="button">
                {preset.label}
              </button>
            ))}
            <button onClick={() => selectRange(undefined)} type="button">
              초기화
            </button>
          </div>
          <p aria-live="polite" className="admin-date-range-help">
            {formatRange(range)}
          </p>
        </div>
      )}
    </div>
  );
}
