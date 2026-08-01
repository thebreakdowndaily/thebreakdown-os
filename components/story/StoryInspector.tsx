'use client';

import { useState } from 'react';
import type { TBSStory } from '@/types/canonical';

interface StoryInspectorProps {
  story: TBSStory;
}

export function StoryInspector({ story }: StoryInspectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => { setOpen(!open); }}
        className="fixed bottom-4 right-4 z-50 bg-[#151515] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#D4A843] hover:border-[#D4A843]/50 transition-colors"
        aria-expanded={open}
        aria-controls="story-inspector"
      >
        {open ? 'Hide Inspector' : 'Story Inspector'}
      </button>

      {open && (
        <div
          id="story-inspector"
          className="fixed bottom-16 right-4 z-50 w-80 max-h-[70vh] overflow-y-auto bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-5 text-xs"
          role="complementary"
          aria-label="Story Inspector"
        >
          <h3 className="text-sm font-bold text-[#D4A843] mb-4 uppercase tracking-wider">Story Inspector</h3>

          <dl className="space-y-3">
            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Story Type</dt>
              <dd className="text-[#F5F5F5]">{story.storyType}</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">TBSS Version</dt>
              <dd className="text-[#F5F5F5]">TBSS-1.0</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Sections Present</dt>
              <dd className="text-[#F5F5F5] space-y-1">
              <span className="block text-[#22C55E]">✓ Hero</span>
              <span className="block text-[#22C55E]">✓ Summary</span>
{story.keyFacts.length > 0 && <span className="block text-[#22C55E]">✓ Key Facts ({story.keyFacts.length})</span>}
              {story.whyItMatters && <span className="block text-[#22C55E]">✓ Why It Matters</span>}
              {story.narrative && <span className="block text-[#22C55E]">✓ Narrative</span>}
              {story.timeline.length > 0 && <span className="block text-[#22C55E]">✓ Timeline ({story.timeline.length})</span>}
              {story.systemExplanation && <span className="block text-[#22C55E]">✓ System Explanation</span>}
              {story.evidence.length > 0 && <span className="block text-[#22C55E]">✓ Evidence ({story.evidence.length})</span>}
              {story.charts.length > 0 && <span className="block text-[#22C55E]">✓ Charts ({story.charts.length})</span>}
              {story.maps && story.maps.length > 0 && <span className="block text-[#22C55E]">✓ Maps ({story.maps.length})</span>}
              {story.stakeholders && <span className="block text-[#22C55E]">✓ Stakeholders ({story.stakeholders.stakeholders.length})</span>}
              {story.perspectives && <span className="block text-[#22C55E]">✓ Perspectives ({story.perspectives.perspectives.length})</span>}
              {story.tradeoffs && story.tradeoffs.length > 0 && <span className="block text-[#22C55E]">✓ Trade-offs ({story.tradeoffs.length})</span>}
              {story.futureOutlook && <span className="block text-[#22C55E]">✓ Future Outlook</span>}
              {story.faq.length > 0 && <span className="block text-[#22C55E]">✓ FAQ ({story.faq.length})</span>}
              {story.sources.length > 0 && <span className="block text-[#22C55E]">✓ Sources ({story.sources.length})</span>}
              </dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Evidence Count</dt>
              <dd className="text-[#F5F5F5]">{story.evidence.length}</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Stakeholder Count</dt>
              <dd className="text-[#F5F5F5]">{story.stakeholders ? story.stakeholders.stakeholders.length : 0}</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Visual Count</dt>
              <dd className="text-[#F5F5F5]">{story.visuals.length}</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Word Count (est.)</dt>
              <dd className="text-[#F5F5F5]">{story.summary.split(/\s+/).length + story.narrative.split(/\s+/).length + story.keyFacts.length * 15}</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Est. Reading Time</dt>
              <dd className="text-[#F5F5F5]">{story.metadata.readingTimeMinutes} min</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Confidence</dt>
              <dd className={`font-bold ${
                story.metadata.confidence === 'High' ? 'text-[#22C55E]' :
                story.metadata.confidence === 'Medium' ? 'text-[#F59E0B]' :
                story.metadata.confidence === 'Low' ? 'text-[#EF4444]' :
                'text-[#A1A1AA]'
              }`}>
                {story.metadata.confidence}
              </dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Last Verified</dt>
              <dd className="text-[#F5F5F5]">{story.metadata.lastVerified}</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Next Verification</dt>
              <dd className="text-[#F5F5F5]">{story.metadata.nextVerificationDue || 'Not scheduled'}</dd>
            </div>

            <div>
              <dt className="text-[#737373] font-semibold uppercase tracking-wider">Difficulty</dt>
              <dd className="text-[#F5F5F5]">{story.metadata.difficulty}</dd>
            </div>
          </dl>
        </div>
      )}
    </>
  );
}