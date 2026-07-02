import React from 'react';
import Container from '@/components/layout/Container';

interface Policy {
  name: string;
  status: string;
  description: string;
}

interface PolicyTrackerProps {
  policies: Policy[];
}

const statusBadgeColor: Record<string, string> = {
  Passed: 'bg-green-500',
  Pending: 'bg-amber-400',
  'Under Review': 'bg-blue-500',
  Rejected: 'bg-red-500',
  Proposed: 'bg-purple-500',
  Defeated: 'bg-red-500',
  Enacted: 'bg-green-500',
  'In Progress': 'bg-amber-400',
  Implemented: 'bg-green-500',
};

const PolicyTracker: React.FC<PolicyTrackerProps> = ({ policies }) => {
  if (policies.length === 0) return null;

  return (
    <section aria-label="Policy tracker" className="py-8">
      <Container>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Policy Tracker</h2>
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-700">
          {policies.map((policy, i) => (
            <div key={i} className="p-4 sm:p-5 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-base font-semibold text-gray-100">{policy.name}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0 ${
                    statusBadgeColor[policy.status] || 'bg-gray-500'
                  }`}
                >
                  {policy.status}
                </span>
              </div>
              <p className="text-sm text-gray-400">{policy.description}</p>
            </div>
          ))}
        </div>
      </div>
      </Container>
    </section>
  );
};

export default PolicyTracker;
