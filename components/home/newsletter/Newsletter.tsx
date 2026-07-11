'use client';

export default function Newsletter() {
  return (
    <section className="py-24 bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-serif text-white mb-6">Receive the Executive Brief</h2>
        <p className="text-neutral-400 mb-8">One email per week. No noise. Just intelligence.</p>
        
        <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-4" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Email address" 
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-6 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
          <button 
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-full font-bold transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
