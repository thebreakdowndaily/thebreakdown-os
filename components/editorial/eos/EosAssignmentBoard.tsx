import Link from 'next/link';
import type { EditorialAssignment } from '@/types/editorial-newsroom';
import { EosStageBadge } from './EosPrimitives';

export const BOARD_STAGES: EditorialAssignment['stage'][] = [
  'assigned',
  'research',
  'writing',
  'fact_check',
  'editorial_review',
  'scheduled',
  'published',
];

export default function EosAssignmentBoard({ assignments }: { assignments: EditorialAssignment[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
      {BOARD_STAGES.map(stage => {
        const items = assignments.filter(a => a.stage === stage);
        return (
          <div key={stage} className="rounded-lg border border-gray-800 bg-gray-950/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <EosStageBadge stage={stage} />
              <span className="text-xs text-gray-500 font-mono">{items.length}</span>
            </div>
            <ul className="space-y-2">
              {items.map(a => (
                <li key={a.id} className="rounded border border-gray-800 bg-gray-900/70 p-2.5">
                  <Link href={`/editor/stories/${a.storyId}`} className="text-xs font-semibold text-amber-300 hover:text-amber-200">
                    {a.title}
                  </Link>
                  <div className="mt-1 text-[10px] text-gray-500">
                    {a.reporters.join(', ')}
                    {a.deadline ? ` · ${new Date(a.deadline).toLocaleDateString()}` : ''}
                  </div>
                  <div className="mt-1">
                    <span className={`text-[10px] font-bold uppercase ${a.priority === 'high' ? 'text-orange-300' : a.priority === 'medium' ? 'text-amber-300' : 'text-gray-500'}`}>
                      {a.priority}
                    </span>
                  </div>
                </li>
              ))}
              {items.length === 0 ? (
                <li className="text-xs text-gray-600 py-2 text-center">—</li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
