import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

export function DesignerPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <>
      <Header title="表單設計器" description={`Template: ${id}`} />
      <div className="flex-1 p-8">
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          WYSIWYG 設計器 - Phase 2 實作（Schema Tree + Field Config + Preview）
        </div>
      </div>
    </>
  );
}
