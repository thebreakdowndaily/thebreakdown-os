'use client';

import React from 'react';
import GlobeRenderer from '@/components/globe/GlobeRenderer';
import SVGRenderer from '@/components/svg/SVGRenderer';
import AnimationRenderer from '@/components/animations/AnimationRenderer';
import InfographicRenderer from '@/components/infographics/InfographicRenderer';
import type { GlobeSpec, SVGSpec, AnimationSpec, InfographicSpec } from '@/utils/types';

export interface StoryVisuals {
  globes?: GlobeSpec[];
  svgs?: SVGSpec[];
  animations?: AnimationSpec[];
  infographics?: InfographicSpec[];
}

interface VisualsProps {
  visuals: StoryVisuals;
}

/**
 * Visuals — Renders advanced visual types (globe, SVG, animation, infographic).
 * Wired to the Visual Intelligence Engine output specs.
 */
const Visuals: React.FC<VisualsProps> = ({ visuals }) => {
  if (!visuals) return null;

  const hasContent = (visuals.globes?.length ?? 0) > 0
    || (visuals.svgs?.length ?? 0) > 0
    || (visuals.animations?.length ?? 0) > 0
    || (visuals.infographics?.length ?? 0) > 0;

  if (!hasContent) return null;

  return (
    <section aria-label="Interactive visualizations" style={{
      width: '100%',
      maxWidth: 'var(--max-width-content)',
      margin: '0 auto',
      padding: 'var(--spacing-8) var(--spacing-4)',
    }}>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-6)',
      }}>
        Visual Analysis
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-8)',
      }}>
        {/* 3D Globes — signature visual */}
        {visuals.globes?.map((globe, i) => (
          <GlobeRenderer key={`globe-${i}`} globe={globe} />
        ))}

        {/* SVG Diagrams — org trees, flowcharts, decision trees */}
        {visuals.svgs?.map((svg, i) => (
          <SVGRenderer key={`svg-${i}`} svg={svg} />
        ))}

        {/* Step-by-step Animations */}
        {visuals.animations?.map((anim, i) => (
          <AnimationRenderer key={`anim-${i}`} animation={anim} />
        ))}

        {/* Infographic Cards */}
        {visuals.infographics?.map((inf, i) => (
          <InfographicRenderer key={`inf-${i}`} cards={inf.cards} />
        ))}
      </div>
    </section>
  );
};

export default Visuals;
