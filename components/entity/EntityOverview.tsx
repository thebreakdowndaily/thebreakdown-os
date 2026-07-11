import React from 'react';
import { Entity } from '@/types/canonical';

export default function EntityOverview({ entity }: { entity: Entity }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2">
        Overview
      </h2>
      
      <p className="text-neutral-300 text-base leading-relaxed">
        {entity.description}
      </p>

      {/* We can add a "Key Facts" list here in the future once EntityBase supports it */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Key Facts</h3>
        <ul className="text-sm text-neutral-400 space-y-2">
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold">&rsaquo;</span>
            Primary focus: {entity.type} sector
          </li>
          {entity.aliases && entity.aliases.length > 0 && (
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">&rsaquo;</span>
              Recognized aliases: {entity.aliases.join(', ')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
