"use client";

import { useEffect, useRef, useState } from "react";

type SelectOption = { label: string; value: string };

/**
 * 브라우저 기본 드롭다운 대신 사이트 색상과 같은 목록을 보여주고,
 * 숨은 input으로 Server Action에 선택값을 그대로 전달하는 관리자용 Select입니다.
 */
export function AdminSelect({
  name,
  options,
  defaultValue,
  ariaLabel,
}: {
  name: string;
  options: SelectOption[];
  defaultValue: string;
  ariaLabel: string;
}) {
  const initialOption = options.find((option) => option.value === defaultValue) ?? options[0];
  const [selected, setSelected] = useState(initialOption);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeWhenClickedOutside(event: MouseEvent) {
      if (!selectRef.current?.contains(event.target as Node)) setIsOpen(false);
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

  return (
    <div className="admin-select" ref={selectRef}>
      <input name={name} type="hidden" value={selected.value} />
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="admin-select-trigger"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span>{selected.label}</span>
        <span aria-hidden="true" className="admin-select-chevron" />
      </button>
      {isOpen && (
        <div aria-label={ariaLabel} className="admin-select-menu" role="listbox">
          {options.map((option) => {
            const isSelected = option.value === selected.value;
            return (
              <button
                aria-selected={isSelected}
                className="admin-select-option"
                key={option.value}
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                {option.label}
                {isSelected && <span aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
