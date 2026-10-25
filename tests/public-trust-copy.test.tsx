import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MissionBar from '../components/home/MissionBar';

describe('evidence-first public trust copy', () => {
  it('describes primary documents as a priority where available, not an absolute guarantee', () => {
    const html = renderToStaticMarkup(createElement(MissionBar));

    expect(html).toContain('primary documents where available');
    expect(html).toContain('where those records are available');
    expect(html).not.toContain('Every citation links to the primary document');
    expect(html).not.toContain('Every reader can verify every step independently');
  });
});
