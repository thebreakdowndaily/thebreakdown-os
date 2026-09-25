import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getClaim, getAllClaims, getClaimsByEntity, getClaimsByConcept } from '../lib/knowledge/claim-registry';
import { getSource, getAllSources, getSourcesByEntity } from '../lib/knowledge/source-registry';

describe('Polish Regression Suite: In-Memory Registry Hydration & Fail-Closed Safety', () => {
  it('auto-seeds claims on demand when accessed directly without prior manual seeding', () => {
    // Calling getClaim directly should automatically ensure the claims map is populated
    const claim = getClaim('claim.partition.security-consciousness');
    assert.ok(claim, 'Claim should be resolved without explicit prior seedClaims() call');
    assert.equal(claim.id, 'claim.partition.security-consciousness');
    assert.equal(claim.confidence, 'established');

    const all = getAllClaims();
    assert.ok(all.length > 50, `Expected over 50 registered claims, got ${all.length}`);

    const byEntity = getClaimsByEntity('un');
    assert.ok(byEntity.length > 0, `Expected claims for UN entity, got ${byEntity.length}`);

    const byConcept = getClaimsByConcept('con-partition');
    assert.ok(byConcept.length > 0, `Expected claims for partition concept, got ${byConcept.length}`);
  });

  it('fails closed safely for nonexistent or unresolved claims', () => {
    const nonexistent = getClaim('claim.nonexistent.fake-claim-12345');
    assert.equal(nonexistent, undefined, 'Unresolved claims must return undefined (fail-closed)');

    const emptyEntityClaims = getClaimsByEntity('nonexistent-entity-slug-xyz');
    assert.deepEqual(emptyEntityClaims, [], 'Unknown entities must yield empty claim array without throwing');
  });

  it('auto-seeds sources on demand when accessed directly', () => {
    const source = getSource('s1');
    assert.ok(source, 'Source s1 should be resolved without explicit prior seedSources() call');
    assert.equal(source.id, 's1');
    assert.ok(source.title.length > 0, 'Source must have title');

    const all = getAllSources();
    assert.ok(all.length > 10, `Expected registered sources, got ${all.length}`);

    const nonExistentSource = getSource('s9999999');
    assert.equal(nonExistentSource, undefined, 'Unresolved source must return undefined');
  });
});
