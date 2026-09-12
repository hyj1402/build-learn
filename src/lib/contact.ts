// 폼(브라우저), Server Action(서버), DB check 제약이 서로 다른 기준을 갖지 않도록 한곳에서 관리합니다.
// 여기 값을 바꾸면 supabase/migrations의 contact_messages check 제약도 함께 맞춰야 합니다.
export const CONTACT_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 3, max: 200 },
  message: { min: 10, max: 5000 },
} as const;

// DB의 email check 제약과 같은 규칙입니다.
// 브라우저의 type="email"은 "a@b"처럼 점이 없는 주소도 통과시키기 때문에, 같은 규칙을 한 번 더 검사해야
// 화면에서는 통과했는데 저장 단계에서 실패하는 상황을 막을 수 있습니다.
export const EMAIL_PATTERN = "[^@\\s]+@[^@\\s]+\\.[^@\\s]+";
export const EMAIL_REGEX = new RegExp(`^${EMAIL_PATTERN}$`);
