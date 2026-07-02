import React from 'react';

interface AuthorBoxProps {
  author: { name: string; avatar?: string; bio?: string; url?: string };
}

const AuthorBox: React.FC<AuthorBoxProps> = ({ author }) => (
  <section aria-label="About the author" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-5">
      {author.avatar ? (
        <img
          src={author.avatar}
          alt={author.name}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <span className="w-16 h-16 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center font-bold text-xl flex-shrink-0">
          {author.name.charAt(0)}
        </span>
      )}
      <div>
        <h2 className="text-lg font-semibold text-gray-100">
          {author.url ? (
            <a
              href={author.url}
              className="hover:text-amber-400 transition-colors"
            >
              {author.name}
            </a>
          ) : (
            author.name
          )}
        </h2>
        {author.bio && <p className="text-sm text-gray-400 mt-2 leading-relaxed">{author.bio}</p>}
        {author.url && (
          <a
            href={author.url}
            className="inline-block mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all stories by {author.name} &rarr;
          </a>
        )}
      </div>
    </div>
  </section>
);

export default AuthorBox;
