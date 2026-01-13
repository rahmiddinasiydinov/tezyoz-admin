export type Language = "UZBEK" | "RUSSIAN" | "ENGLISH" | "KRILL";

export interface Text {
  id: string;
  language: Language;
  content: string;
  createdAt: string;
}

export interface TextsResponse {
  success: boolean;
  data: Text[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTextDto {
  language: Language;
  content: string;
}
