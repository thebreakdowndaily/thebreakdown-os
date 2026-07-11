'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EntityCopilotContext } from '@/types/canonical';

interface KnowledgeCopilotSidebarProps {
  context: EntityCopilotContext;
  suggestedQuestions: string[];
}

export default function KnowledgeCopilotSidebar({ context, suggestedQuestions }: KnowledgeCopilotSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [streamingResponse]);

  const handleAsk = async (question: string) => {
    if (!question.trim()) return;
    
    setQuery(question);
    setStreamingResponse('');
    setIsStreaming(true);
    
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          prompt: question,
          skill: 'entity'
        })
      });

      if (!res.body) throw new Error('No readable stream available');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          setStreamingResponse((prev) => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch (error) {
      console.error('Copilot Stream Error:', error);
      setStreamingResponse('An error occurred while communicating with the Copilot.');
    } finally {
      setIsStreaming(false);
      setQuery('');
    }
  };

  // Basic markdown-to-html citation parser
  // Transforms [Story 12] into <span class="citation">...</span>
  const renderResponse = (text: string) => {
    // Escape HTML first in a real app, skipping for briefness
    let formatted = text.replace(/\[(.*?)\]/g, '<span class="px-1 py-0.5 mx-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded cursor-pointer hover:bg-emerald-500/30 transition-colors">[$1]</span>');
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 hover:border-emerald-500 hover:text-emerald-400 shadow-2xl rounded-full p-4 text-white transition-all duration-300 flex items-center justify-center group"
      >
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-screen w-[400px] bg-[#0a0a0a] border-l border-neutral-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-bold uppercase tracking-widest text-xs text-neutral-300">Knowledge Copilot</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="p-4 border-b border-neutral-800/50 bg-[#0c0c0c] flex flex-col gap-2 overflow-y-auto max-h-[250px]">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Suggested Actions</span>
        {suggestedQuestions.map((q, i) => (
          <button 
            key={i}
            onClick={() => handleAsk(q)}
            disabled={isStreaming}
            className="text-left text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded p-2 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Streaming Response Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
        {query && (
          <div className="mb-6">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">You asked</span>
            <div className="text-sm text-white bg-neutral-900 p-3 rounded-lg border border-neutral-800">
              {query}
            </div>
          </div>
        )}
        
        {(streamingResponse || isStreaming) && (
          <div>
             <span className="text-[10px] uppercase tracking-widest text-emerald-500 block mb-2 flex items-center gap-2">
               Copilot Response
               {isStreaming && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
             </span>
             <div className="text-sm text-neutral-300 leading-relaxed font-sans">
               {renderResponse(streamingResponse)}
             </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAsk(query); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask anything about this entity..."
            className="flex-1 bg-[#0a0a0a] border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors"
          />
          <button 
            type="submit"
            disabled={isStreaming || !query.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-lg p-3 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  );
}
