/**
 * 관리자 활동 감시 컴포넌트가 보내는 가벼운 신호입니다.
 * 이 경로도 `/admin` Proxy를 먼저 거치므로 별도 데이터를 저장하지 않아도 활동 쿠키가 갱신됩니다.
 */
export async function POST() {
  return new Response(null, { status: 204 });
}
