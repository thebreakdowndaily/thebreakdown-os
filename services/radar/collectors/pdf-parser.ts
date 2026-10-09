import { inflateSync } from 'node:zlib';

export interface ExtractedPdfDocument {
  text: string;
  normalizedText: string;
  title?: string;
  orderNumber?: string;
  isAmendment: boolean;
  isCorrigendum: boolean;
  versionMarker?: string;
  creationDate?: string;
  modDate?: string;
  pdfVersion?: string;
}

/**
 * Cleanly extracts text and versioning metadata from a PDF Buffer.
 * Handles uncompressed streams and FlateDecode compressed streams via native zlib.
 */
export function parsePdfBuffer(buffer: Buffer): ExtractedPdfDocument {
  const binaryString = buffer.toString('binary');
  
  // 1. Detect PDF version
  const versionMatch = binaryString.match(/%PDF-(\d+\.\d+)/);
  const pdfVersion = versionMatch ? versionMatch[1] : undefined;

  // 2. Extract Metadata from PDF Info dictionary
  const titleMatch = binaryString.match(/\/Title\s*\(([^)]+)\)/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;
  
  const creationMatch = binaryString.match(/\/CreationDate\s*\(([^)]+)\)/i);
  const creationDate = creationMatch ? creationMatch[1].trim() : undefined;

  const modMatch = binaryString.match(/\/ModDate\s*\(([^)]+)\)/i);
  const modDate = modMatch ? modMatch[1].trim() : undefined;

  // 3. Extract Streams
  const textChunks: string[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(binaryString)) !== null) {
    const rawStreamContent = match[1];
    const streamStartPos = match.index + match[0].indexOf(rawStreamContent);
    const streamBuffer = buffer.subarray(streamStartPos, streamStartPos + rawStreamContent.length);

    let decodedContent = '';
    try {
      // Attempt flate decompression
      const decompressed = inflateSync(streamBuffer);
      decodedContent = decompressed.toString('utf-8');
    } catch {
      // Fallback to uncompressed ASCII/UTF-8 representation
      decodedContent = rawStreamContent;
    }

    const chunk = extractTextFromPdfStream(decodedContent);
    if (chunk) {
      textChunks.push(chunk);
    }
  }

  // Fallback: If no stream extracted text, scan raw buffer for literal BT...ET operators
  if (textChunks.length === 0) {
    const fallbackText = extractTextFromPdfStream(binaryString);
    if (fallbackText) textChunks.push(fallbackText);
  }

  const rawText = textChunks.join('\n\n').trim();
  const normalizedText = rawText.replace(/\s+/g, ' ').normalize('NFKC').trim();

  // 4. Document versioning & legal metadata heuristics (e.g. MP Gazette / High Court / Orders)
  const isCorrigendum = /corrigendum|शुद्धिपत्र/i.test(normalizedText);
  const isAmendment = /amendment|संशोधन|revised\s+order|supersedes/i.test(normalizedText);

  // Extract Order / Gazette / Notification numbers
  const orderMatch = normalizedText.match(
    /(?:Order\s+No\.?|Notification\s+No\.?|No\.?|Gazette\s+No\.?|क्रमांक|आदेश\s+क्र\.)\s*[:.-]?\s*([A-Za-z0-9\/-]+)/i
  );
  const orderNumber = orderMatch ? orderMatch[1].trim() : undefined;

  let versionMarker: string | undefined;
  if (isCorrigendum) {
    versionMarker = 'corrigendum';
  } else if (isAmendment) {
    versionMarker = 'amendment';
  } else if (orderNumber) {
    versionMarker = `order:${orderNumber}`;
  }

  return {
    text: rawText,
    normalizedText,
    title,
    orderNumber,
    isAmendment,
    isCorrigendum,
    versionMarker,
    creationDate,
    modDate,
    pdfVersion,
  };
}

/**
 * Extracts visible strings from BT ... ET operator blocks.
 */
function extractTextFromPdfStream(content: string): string {
  const texts: string[] = [];
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let btMatch: RegExpExecArray | null;

  while ((btMatch = btRegex.exec(content)) !== null) {
    const block = btMatch[1];

    // Handle (Text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      texts.push(unescapePdfString(tjMatch[1]));
    }

    // Handle [(Text) -10 (More)] TJ
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = arrMatch[1];
      const strParts = inner.match(/\(([^)]*)\)/g);
      if (strParts) {
        const line = strParts
          .map((s) => unescapePdfString(s.slice(1, -1)))
          .join('');
        texts.push(line);
      }
    }

    // Handle <Hex> Tj
    const hexRegex = /<([0-9A-Fa-f]+)>\s*Tj/g;
    let hexMatch: RegExpExecArray | null;
    while ((hexMatch = hexRegex.exec(block)) !== null) {
      const hex = hexMatch[1];
      let decoded = '';
      for (let i = 0; i < hex.length; i += 2) {
        decoded += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      texts.push(decoded);
    }
  }

  return texts.join(' ');
}

function unescapePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}
