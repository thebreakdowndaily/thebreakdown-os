import { isValidConstituencyId, isValidClaimId } from '../types/research/identifiers';

const testCases = [
  { id: 'UP-AC-001', type: 'constituency', expect: true },
  { id: 'UP-AC-403', type: 'constituency', expect: true },
  { id: 'UP-AC-001-CLAIM-000001', type: 'claim', expect: true },
  { id: 'UP-AC-000', type: 'constituency', expect: false },
  { id: 'UP-AC-404', type: 'constituency', expect: false },
  { id: 'UP-AC-1', type: 'constituency', expect: false },
  { id: 'UP-AC-01', type: 'constituency', expect: false },
  { id: 'UP-AC-001-CLAIM-1', type: 'claim', expect: false },
];

testCases.forEach(({ id, type, expect }) => {
  const result = type === 'constituency' ? isValidConstituencyId(id) : isValidClaimId(id);
  console.log(`${id} (${type}) => ${result} (expected ${expect})`);
});
