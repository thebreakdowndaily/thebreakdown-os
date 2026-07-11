'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfidenceMeter from './ConfidenceMeter';

interface EvidenceProps {
  claims: Array<{
    claim: string;
    source: string;
    verification: 'true' | 'false' | 'misleading' | 'unverifiable';
    explanation: string;
    confidence: number;
  }>;
  sources: Array<{ name: string; url: string; type: string; tier: number }>;
  verificationScore: number;
}

const verificationConfig: Record<string, { label: string; bg: string; text: string }> = {
  true: { label: 'TRUE', bg: 'bg-green-500/20', text: 'text-green-400' },
  false: { label: 'FALSE', bg: 'bg-red-500/20', text: 'text-red-400' },
  misleading: { label: 'MISLEADING', bg: 'bg-amber-400/20', text: 'text-amber-400' },
  unverifiable: { label: 'UNVERIFIABLE', bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

const Evidence: React.FC<EvidenceProps> = ({ claims, sources, verificationScore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRefId, setActiveRefId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setActiveRefId(customEvent.detail);
      setIsOpen(true);
      
      // Auto-scroll to claim if needed
      setTimeout(() => {
        const el = document.getElementById(`claim-${customEvent.detail}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    };
    
    window.addEventListener('open-evidence', handleOpen);
    return () => { window.removeEventListener('open-evidence', handleOpen); };
  }, []);

  const verified = claims.filter(c => c.verification === 'true').length;
  const misleading = claims.filter(c => c.verification === 'misleading').length;
  const unverifiable = claims.filter(c => c.verification === 'unverifiable').length;

  const t1t2 = sources.filter(s => s.tier <= 2).length;
  const sourceQuality = sources.length > 0 ? Math.round((t1t2 / sources.length) * 100) : 0;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsOpen(false); }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#121212] border-l border-[#2A2A2A] shadow-2xl z-50 overflow-y-auto flex flex-col"
          >
            <div className="sticky top-0 bg-[#121212]/90 backdrop-blur border-b border-[#2A2A2A] p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-[#F5F5F5]">Evidence & Verification</h2>
              <button
                onClick={() => { setIsOpen(false); }}
                className="p-2 text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors rounded-full hover:bg-white/5"
                aria-label="Close evidence panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              <ConfidenceMeter 
                overallScore={verificationScore}
                sourceQuality={sourceQuality}
                confirmations={80}
                dataAvailability={70}
                verificationStatus={Math.round((verified / claims.length) * 100) || 0}
                totalClaims={claims.length}
                verified={verified}
                misleading={misleading}
                unverifiable={unverifiable}
              />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Claims Breakdown</h3>
                {claims.map((item, i) => {
                  const vc = verificationConfig[item.verification];
                  const isHighlighted = activeRefId === String(i + 1);
                  return (
                    <div 
                      key={i} 
                      id={`claim-${String(i+1)}`}
                      className={`bg-[#0F0F0F] border ${isHighlighted ? 'border-brand-400' : 'border-[#1F1F1F]'} rounded-xl p-5 transition-colors`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="font-medium text-[#F5F5F5] leading-relaxed">
                          <sup className="text-brand-400 font-bold mr-1">[{i + 1}]</sup>
                          {item.claim}
                        </p>
                        <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${vc.bg} ${vc.text}`}>
                          {vc.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] mb-2">
                        Source: <span className="text-[#D4D4D8]">{item.source}</span>
                      </p>
                      <p className="text-sm text-[#D4D4D8] leading-relaxed">{item.explanation}</p>
                      {item.confidence > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#1F1F1F]">
                          <p className="text-xs font-medium text-[#A1A1AA]">Confidence: <span className="text-[#F5F5F5]">{item.confidence}%</span></p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Evidence;
