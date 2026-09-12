import { ContentImageUpload } from "@/components/admin/ContentImageUpload";

/** 프로젝트 대표 이미지에 공용 16:9 배너 업로더를 연결합니다. */
export function ProjectImageUpload({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <ContentImageUpload defaultValue={defaultValue} fieldName="thumbnail_path" folder="projects" />
  );
}
