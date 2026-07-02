'use client';

import React from 'react';

const Newsletter: React.FC = () => (
  <section aria-label="Newsletter signup" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">
        Stay Informed
      </h2>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Get the latest stories delivered to your inbox.
      </p>
      <form
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        onSubmit={(e) => { e.preventDefault(); }}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-semibold text-sm hover:bg-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-800 whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
    </div>
  </section>
);

export default Newsletter;
