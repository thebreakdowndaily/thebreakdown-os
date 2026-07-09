import React from 'react';
import Image from 'next/image';

interface AuthorBoxProps {
  author: { name: string; avatar?: string; bio?: string; url?: string };
}

const AuthorBox: React.FC<AuthorBoxProps> = ({ author }) => (
  <section aria-label="About the author" className="max-w-[720px] mx-auto px-4 sm:px-6 mb-16 pt-8 border-t border-neutral-800/60">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={80}
          height={80}
          className="rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <span className="w-20 h-20 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-2xl flex-shrink-0">
          {author.name.charAt(0)}
        </span>
      )}
      <div className="pt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
          Written By
        </p>
        <h2 className="text-xl font-medium text-neutral-100 mb-2">
          {author.url ? (
            <a href={author.url} className="hover:text-amber-400 transition-colors">
              {author.name}
            </a>
          ) : (
            author.name
          )}
        </h2>
        {author.bio && <p className="text-[15px] text-neutral-400 leading-relaxed mb-3 max-w-lg">{author.bio}</p>}
        {author.url && (
          <a
            href={author.url}
            className="inline-block text-xs font-medium text-amber-400/70 hover:text-amber-400 transition-colors"
          >
            View all stories by {author.name} &rarr;
          </a>
        )}
      </div>
    </div>
  </section>
);

export default AuthorBox;
