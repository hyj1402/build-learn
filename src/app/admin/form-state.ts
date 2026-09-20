// "use server" 파일은 async 함수만 export할 수 있습니다.
// 폼이 공유하는 상태 값은 별도 모듈에 두어 Server Action과 Client Component가 함께 안전하게 사용합니다.
export type AdminContentFormState = { status: "idle" | "error"; message: string };

export const IDLE_STATE: AdminContentFormState = { status: "idle", message: "" };
