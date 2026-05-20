// 오프라인 다운로드 엔트리. P2-7 도입 시 본격 활용.
// 현 단계에선 mmkvStore.offlineMap 의 값 타입 + playbackSource 분기 용도로만 사용된다.
export interface OfflineEntry {
  contentId: string;
  localPath: string;
  downloadedAt: string;
  byteSize: number;
}
