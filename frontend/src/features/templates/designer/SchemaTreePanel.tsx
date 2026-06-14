import { useState } from 'react';
import { ChevronRight, Lock, CircleDot, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FieldConfigResponse, TfFieldNode } from '@/types/api';

export type Selection =
  | { kind: 'tree'; tfPath: string; node: TfFieldNode }
  | { kind: 'unmapped'; fieldKey: string };

type Props = {
  fields: TfFieldNode[];
  unmappedConfigs: FieldConfigResponse[];
  configuredTfPaths: Set<string>;
  selection: Selection | null;
  onSelect: (sel: Selection) => void;
};

export function SchemaTreePanel({
  fields,
  unmappedConfigs,
  configuredTfPaths,
  selection,
  onSelect,
}: Props) {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 overflow-hidden rounded-lg border border-border bg-card p-3">
      <div className="space-y-2 overflow-y-auto pr-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Schema Tree
        </h3>
        <ul className="space-y-0.5">
          {fields.map((node) => (
            <TreeNode
              key={node.tfPath}
              node={node}
              depth={0}
              configuredTfPaths={configuredTfPaths}
              selection={selection}
              onSelect={onSelect}
            />
          ))}
        </ul>

        {unmappedConfigs.length > 0 && (
          <div className="mt-4 space-y-1 border-t border-border pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Unmapped Configs
            </h3>
            <ul className="space-y-0.5">
              {unmappedConfigs.map((cfg) => {
                const active =
                  selection?.kind === 'unmapped' && selection.fieldKey === cfg.fieldKey;
                return (
                  <li key={cfg.id}>
                    <button
                      type="button"
                      onClick={() => onSelect({ kind: 'unmapped', fieldKey: cfg.fieldKey })}
                      className={cn(
                        'flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-accent',
                        active && 'bg-accent text-accent-foreground',
                      )}
                    >
                      <CircleDot className="h-3 w-3 text-emerald-500" />
                      <span className="truncate">{cfg.displayName || cfg.fieldKey}</span>
                      <span className="ml-auto truncate text-xs text-muted-foreground">
                        {cfg.fieldKey}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

type NodeProps = {
  node: TfFieldNode;
  depth: number;
  configuredTfPaths: Set<string>;
  selection: Selection | null;
  onSelect: (sel: Selection) => void;
};

function TreeNode({ node, depth, configuredTfPaths, selection, onSelect }: NodeProps) {
  const [open, setOpen] = useState(depth < 1);
  const isNested = node.nestedBlock;
  const hasChildren = node.children.length > 0;
  const configured = configuredTfPaths.has(node.tfPath);
  const active = selection?.kind === 'tree' && selection.tfPath === node.tfPath;
  const leafLabel = node.tfPath.split('.').pop() ?? node.tfPath;

  const handleClick = () => {
    if (hasChildren) {
      setOpen((v) => !v);
    }
    if (!isNested) {
      onSelect({ kind: 'tree', tfPath: node.tfPath, node });
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm hover:bg-accent',
          active && 'bg-accent text-accent-foreground',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-90')}
          />
        ) : (
          <span className="inline-block w-3" />
        )}
        {configured && !isNested && <CircleDot className="h-3 w-3 shrink-0 text-emerald-500" />}
        {isNested && <Layers className="h-3 w-3 shrink-0 text-amber-500" />}
        <span className="truncate font-mono text-[13px]">{leafLabel}</span>
        {node.required && (
          <span className="ml-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
        )}
        {node.computed && <Lock className="ml-1 h-3 w-3 shrink-0 text-muted-foreground" />}
        <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
          {isNested ? node.nestingMode ?? 'block' : node.tfType}
        </Badge>
      </button>
      {hasChildren && open && (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <TreeNode
              key={child.tfPath}
              node={child}
              depth={depth + 1}
              configuredTfPaths={configuredTfPaths}
              selection={selection}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
