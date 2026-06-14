export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: ApiError | null;
  message: string;
  timestamp: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CloudProvider = 'ALIYUN' | 'AWS';

export type ResourceType = 'RDS' | 'ELASTICSEARCH' | 'REDIS' | 'MONGODB' | 'CLICKHOUSE';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type TemplateSummary = {
  id: string;
  cloudProvider: CloudProvider;
  resourceType: ResourceType;
  tfResourceName: string;
  tfProviderVersion: string | null;
  displayName: string;
  description: string | null;
  icon: string | null;
  status: TemplateStatus;
  updatedAt: string;
};

export type SchemaSourceItem = {
  provider: string;
  version: string;
  resourceCount: number;
};
