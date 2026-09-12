"use client";

import { useState, type ReactNode } from "react";

type Tab = { id: string; label: string; content: ReactNode };

/**
 * 관련 정보를 구역으로 나눠 보여줄 때 쓰는 기본 탭입니다.
 * 방향키로도 탭을 이동할 수 있도록 role="tablist"/"tab"/"tabpanel"과 화살표 키 처리를 함께 둡니다.
 */
export function AdminTabs({
  tabs,
  defaultTabId,
  label,
}: {
  tabs: Tab[];
  defaultTabId?: string;
  label: string;
}) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);

  function moveTo(direction: 1 | -1) {
    const index = tabs.findIndex((tab) => tab.id === activeId);
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    setActiveId(next.id);
    document.getElementById(`admin-tab-${next.id}`)?.focus();
  }

  return (
    <div className="admin-tabs">
      <div role="tablist" aria-label={label} className="admin-tab-list">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`admin-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`admin-tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`admin-tab${isActive ? " is-active" : ""}`}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") moveTo(1);
                if (event.key === "ArrowLeft") moveTo(-1);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`admin-tabpanel-${tab.id}`}
          aria-labelledby={`admin-tab-${tab.id}`}
          hidden={tab.id !== activeId}
          className="admin-tab-panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
