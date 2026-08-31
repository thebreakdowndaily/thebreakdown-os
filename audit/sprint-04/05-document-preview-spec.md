# Primary Document Preview Specification

Status: Shipped & Active
Component: `components/documents/DocumentPreviewModal.tsx`
Governance: AGENTS.md v1.0 — Platform Beta / Security & Accessibility Rules

---

## 1. Safety & Architecture Rules

1. **Approved Source Set Only**: The preview modal operates exclusively on verified records registered in canonical `TrackerDocument` definitions.
2. **No Arbitrary Remote URL Proxying**: The application does not fetch or execute third-party scripts or render arbitrary unvetted IFrames. Direct official download links open in new secure tabs with `rel="noopener noreferrer"`.
3. **Provenance Preservation**: Previews display originating publisher, publication date, document category, verified summary, and statutory clause citations.

---

## 2. Modal Accessibility & UX

- **Focus Management**: Automatically focuses the modal's primary close button on open and restores previous focus on dismiss.
- **Escape Key Handling**: Global `Escape` listener allows instantaneous dismissal.
- **Backdrop Dismissal**: Clicking outside the dialog card triggers safe close.
- **ARIA Conformance**: Bound via `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="doc-preview-title"`.
