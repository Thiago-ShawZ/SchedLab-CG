import { ExternalLink } from 'lucide-react';
import type { Source } from '@/types/product';

interface SourceListProps {
  sources: Source[];
}

export default function SourceList({ sources }: SourceListProps) {
  if (!sources.length) return null;

  return (
    <div className="space-y-2">
      {sources.map((source, i) => (
        <a
          key={i}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-brand-400 transition-colors hover:text-brand-300 hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{source.title}</span>
        </a>
      ))}
    </div>
  );
}
