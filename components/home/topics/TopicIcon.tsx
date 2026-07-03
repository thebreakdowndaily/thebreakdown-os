interface TopicIconProps {
  slug: string;
}

const icons: Record<string, string> = {
  economy: '\uD83D\uDCC8',
  technology: '\uD83D\uDCF1',
  policy: '\uD83D\uDCDD',
  agriculture: '\uD83C\uDF3E',
  'digital-payments': '\uD83D\uDCB3',
  defence: '\uD83D\uDEE1\uFE0F',
  climate: '\uD83C\uDF27\uFE0F',
  healthcare: '\uD83C\uDFE5',
  elections: '\uD83D\uDDF3\uFE0F',
  governance: '\uD83C\uDFDB\uFE0F',
  economyfinance: '\uD83D\uDCC8',
};

export default function TopicIcon({ slug }: TopicIconProps) {
  return (
    <span className="text-2xl leading-none" aria-hidden="true">
      {icons[slug] || '\uD83D\uDCCA'}
    </span>
  );
}
