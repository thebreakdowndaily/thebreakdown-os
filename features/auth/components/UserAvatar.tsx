'use client';

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: number;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const COLORS = ['#D4A843', '#22C55E', '#3B82F6', '#A855F7', '#F43F5E', '#F97316', '#06B6D4'];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function UserAvatar({ name, image, size = 32 }: UserAvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colorFromName(name),
        color: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        flexShrink: 0,
        lineHeight: 1,
      }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}
