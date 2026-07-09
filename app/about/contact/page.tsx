import type { Metadata } from 'next';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Contact — The Breakdown',
  description: 'Get in touch with The Breakdown editorial team.',
};

export default function ContactPage() {
  return (
    <Container>
      <div className="py-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-6">Contact</h1>
        <div className="prose prose-invert prose-amber max-w-none space-y-4 text-gray-300">
          <p>Have a tip, data source, or story idea? We&apos;d love to hear from you.</p>
          <div className="p-6 bg-[#151515] rounded-lg border border-[#2A2A2A] mt-6">
            <h2 className="text-lg font-semibold text-white mb-4">Get in Touch</h2>
            <p className="mb-2"><strong className="text-amber-400">Email:</strong> editors@thebreakdown.in</p>
            <p className="mb-2"><strong className="text-amber-400">Twitter:</strong> @thebreakdown</p>
            <p><strong className="text-amber-400">Signal:</strong> +91-XXXXXXXXXX</p>
          </div>
          <div className="p-6 bg-[#151515] rounded-lg border border-[#2A2A2A] mt-4">
            <h2 className="text-lg font-semibold text-white mb-4">Submit a Tip</h2>
            <p>If you have documents, data, or information you&apos;d like to share securely, you can reach us via encrypted email or Signal. We protect the confidentiality of all sources.</p>
          </div>
        </div>
      </div>
    </Container>
  );
}
