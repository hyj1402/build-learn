const DEFAULT_SOCIAL_IMAGE = "/og-default.png";
// 다수의 공유 서비스가 지원하는 래스터 이미지 확장자만 허용합니다. SVG는 공용 PNG로 대체합니다.
const SOCIAL_IMAGE_FORMAT = /\.(?:png|jpe?g|webp)(?:[?#].*)?$/i;

/** 링크 공유용으로 안전한 이미지 경로를 선택합니다. */
export function getSocialImage(image?: string): string {
  return image && SOCIAL_IMAGE_FORMAT.test(image) ? image : DEFAULT_SOCIAL_IMAGE;
}
