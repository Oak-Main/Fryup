import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderPacketArticle, type Packet } from '../../src/lib/packet-render';

const slugs = ['bubble-and-squeak', 'bubble-and-squeak-with-fried-eggs'];

describe.each(slugs)('%s leftover reheating', (slug) => {
  const packet = JSON.parse(readFileSync(new URL(`../../src/content/packets/${slug}.json`, import.meta.url), 'utf8')) as Packet;
  const html = renderPacketArticle(packet, { src: `/images/recipes/${slug}.jpg`, width: 1200, height: 800 });
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)![1]);
  const instructions = ld.recipeInstructions.map((s: {text: string}) => s.text).join(' ');

  it('keeps the visible recipe and structured instructions aligned on the reheating check', () => {
    expect(html).toContain('steaming hot throughout');
    expect(html).toContain('75 °C for 30 seconds');
    expect(instructions).toContain('steaming hot throughout');
    expect(instructions).toContain('75 °C for 30 seconds');
    expect(html).not.toMatch(/70 °C(?: or above|\+)/);
  });

  it('limits leftover storage and repeat reheating without changing article structure', () => {
    expect(html).toContain('within 2 days of originally cooking');
    expect(html).not.toContain('3 days refrigerated');
    expect(html).toMatch(/reheat(?:ed)? only once|do not reheat them again/);
    expect((html.match(/data-rpc="content"/g) ?? []).length).toBe(1);
    expect(html).toContain('data-lock="instructions"');
  });
});
