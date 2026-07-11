import RelatedEntities from './RelatedEntities';
import StoryGraphMini from '@/components/graph/StoryGraphMini';
import type { Story, Entity } from '@/types/canonical';

interface KnowledgeLayerProps {
  story: Story;
  relatedEntities: Entity[];
}

export default function KnowledgeLayer({ story, relatedEntities }: KnowledgeLayerProps) {
  if (relatedEntities.length === 0 && story.tags.length === 0) return null;

  return (
    <section aria-label="Knowledge Connections" className="w-full py-12 sm:py-16 border-t border-[#2A2A2A] mt-12 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
          <div className="space-y-10">
            {relatedEntities.length > 0 && (
              <RelatedEntities
                entities={relatedEntities.map((e) => ({
                  id: e.id,
                  slug: e.slug,
                  name: e.name,
                  type: e.type,
                  description: e.description,
                }))}
              />
            )}
            
            {story.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A1A1AA] mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag, i) => (
                    <a
                      key={i}
                      href={`/topic/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-3 py-1.5 text-sm bg-[#151515] border border-[#2A2A2A] hover:border-[#D4A843]/50 text-[#F5F5F5] rounded-full transition-colors"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:border-l lg:border-[#2A2A2A] lg:pl-10 xl:pl-16">
            <StoryGraphMini story={story} relatedEntities={relatedEntities} />
          </div>
        </div>
      </div>
    </section>
  );
}
