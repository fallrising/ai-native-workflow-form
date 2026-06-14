import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type {
  FieldConfigResponse,
  FieldConfigUpdateRequest,
  SchemaTreeResponse,
  TemplateDetail,
} from '@/types/api';

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.templates.detail(id ?? ''),
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<TemplateDetail>(`/templates/${id}`);
      return data;
    },
  });
}

export function useSchemaTree(
  provider: string | null | undefined,
  version: string | null | undefined,
  resourceName: string | null | undefined,
) {
  return useQuery({
    queryKey: queryKeys.schemas.resourceTree(provider ?? '', version ?? '', resourceName ?? ''),
    enabled: !!provider && !!version && !!resourceName,
    queryFn: async () => {
      const { data } = await api.get<SchemaTreeResponse>(
        `/tf-schemas/${provider}/${version}/resources/${resourceName}`,
      );
      return data;
    },
  });
}

export function useFieldConfigs(templateId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.templates.fields(templateId ?? ''),
    enabled: !!templateId,
    queryFn: async () => {
      const { data } = await api.get<FieldConfigResponse[]>(`/templates/${templateId}/fields`);
      return data;
    },
  });
}

export function useUpsertFieldConfig(templateId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: FieldConfigUpdateRequest) => {
      const { data } = await api.put<FieldConfigResponse>(
        `/templates/${templateId}/fields/${body.fieldKey}`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      toast.success('已保存');
      qc.invalidateQueries({ queryKey: queryKeys.templates.fields(templateId ?? '') });
    },
  });
}

export function useResetFieldConfigs(templateId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<FieldConfigResponse[]>(
        `/templates/${templateId}/fields/reset`,
      );
      return data;
    },
    onSuccess: () => {
      toast.success('已重置');
      qc.invalidateQueries({ queryKey: queryKeys.templates.fields(templateId ?? '') });
    },
  });
}
