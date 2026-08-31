import type { TrackerDefinition } from '@/lib/trackers/types';
import GenericTracker from './GenericTracker';

interface MgnregaTrackerProps {
  tracker: TrackerDefinition;
}

export default function MgnregaTrackerComponent({ tracker }: MgnregaTrackerProps) {
  return <GenericTracker tracker={tracker} />;
}
