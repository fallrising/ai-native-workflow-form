import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { SchemaTreePanel, type Selection } from './designer/SchemaTreePanel';
import { FieldConfigPanel } from './designer/FieldConfigPanel';
import {
  useFieldConfigs,
  useSchemaTree,
  useTemplate,
} from './designer/hooks';
import type { CloudProvider, FieldConfigResponse, SchemaSourceItem, TfFieldNode } from '@/types/api';

const PROVIDER_TO_SCHEMA: Record<CloudProvider, string> = {
  ALIYUN: 'alicloud',
  AWS: 'aws',
};

function flattenLeafTfPaths(nodes: TfFieldNode[]): Map<string, TfFieldNode> {
  const map = new Map<string, TfFieldNode>();
  function walk(node: TfFieldNode) {
    if (!node.nestedBlock) map.set(node.tfPath, node);
    node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return map;
}

export function DesignerPage() {
  const { id } = useParams<{ id: string }>();
  const [selection, setSelection] = useState<Selection | null>(null);

  const templateQ = useTemplate(id);
  const template = templateQ.data;

  const schemaProvider = template ? PROVIDER_TO_SCHEMA[template.cloudProvider] : null;

  const sourcesQ = useQuery({
    queryKey: queryKeys.schemas.sources(),
    enabled: !!template && !template.tfProviderVersion,
    queryFn: async () => {
      const { data } = await api.get<SchemaSourceItem[]>('/tf-schemas');
      return data;
    },
  });

  const effectiveVersion = useMemo(() => {
    if (template?.tfProviderVersion) return template.tfProviderVersion;
    if (!schemaProvider || !sourcesQ.data) return null;
    return sourcesQ.data.find((s) => s.provider === schemaProvider)?.version ?? null;
  }, [template?.tfProviderVersion, schemaProvider, sourcesQ.data]);

  const treeQ = useSchemaTree(schemaProvider, effectiveVersion, template?.tfResourceName);
  const fieldsQ = useFieldConfigs(id);

  const tree = treeQ.data?.fields ?? [];
  const fields = fieldsQ.data ?? [];

  const leafIndex = useMemo(() => flattenLeafTfPaths(tree), [tree]);

  const configuredTfPaths = useMemo(
    () => new Set(fields.filter((f) => f.tfPath != null).map((f) => f.tfPath as string)),
    [fields],
  );

  const unmappedConfigs = useMemo(() => fields.filter((f) => f.tfPath == null), [fields]);

  const selectedConfig: FieldConfigResponse | null = useMemo(() => {
    if (!selection) return null;
    if (selection.kind === 'unmapped') {
      return fields.find((f) => f.fieldKey === selection.fieldKey) ?? null;
    }
    const matches = fields.filter((f) => f.tfPath === selection.tfPath);
    if (matches.length === 0) return null;
    return matches.find((m) => m.fieldKey === selection.tfPath) ?? matches[0]!;
  }, [selection, fields]);

  const selectedNode: TfFieldNode | null = useMemo(() => {
    if (selection?.kind !== 'tree') return null;
    return selection.node ?? leafIndex.get(selection.tfPath) ?? null;
  }, [selection, leafIndex]);

  const currentFieldKey = selectedConfig?.fieldKey ?? null;
  const otherFieldKeys = useMemo(
    () => fields.map((f) => f.fieldKey).filter((k) => k !== currentFieldKey),
    [fields, currentFieldKey],
  );

  if (templateQ.isLoading) {
    return <DesignerStatus message="載入模板中…" />;
  }
  if (templateQ.error || !template) {
    return <DesignerStatus message="模板載入失敗" />;
  }

  return (
    <>
      <Header
        title={template.displayName}
        description={`${template.cloudProvider} · ${template.tfResourceName}`}
        actions={<Badge variant="outline">{template.status}</Badge>}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_360px] gap-4 overflow-hidden p-4">
        {treeQ.isLoading || fieldsQ.isLoading ? (
          <Card className="p-4 text-sm text-muted-foreground">載入 Schema…</Card>
        ) : treeQ.error ? (
          <Card className="p-4 text-sm text-destructive">Schema 載入失敗</Card>
        ) : (
          <SchemaTreePanel
            fields={tree}
            unmappedConfigs={unmappedConfigs}
            configuredTfPaths={configuredTfPaths}
            selection={selection}
            onSelect={setSelection}
          />
        )}

        <FieldConfigPanel
          templateId={id!}
          selectedNode={selectedNode}
          selectedConfig={selectedConfig}
          otherFieldKeys={otherFieldKeys}
        />

        <Card className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
          Preview · Phase 2 M2
        </Card>
      </div>
    </>
  );
}

function DesignerStatus({ message }: { message: string }) {
  return (
    <>
      <Header title="表單設計器" />
      <div className="flex-1 p-8 text-sm text-muted-foreground">{message}</div>
    </>
  );
}
