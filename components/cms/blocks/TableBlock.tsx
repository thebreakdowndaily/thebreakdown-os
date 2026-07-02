'use client';

import type { Block } from '@/utils/cms-data';

interface TableBlockProps {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

export default function TableBlock({ block, onUpdate }: TableBlockProps) {
  const d = block.data;
  const headers: string[] = d.headers || [''];
  const rows: string[][] = d.rows || [['']];

  const updateHeader = (idx: number, value: string) => {
    const next = [...headers];
    next[idx] = value;
    onUpdate({ ...d, headers: next });
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const next = rows.map((r) => [...r]);
    next[rowIdx][colIdx] = value;
    onUpdate({ ...d, rows: next });
  };

  const addRow = () => { onUpdate({ ...d, rows: [...rows, headers.map(() => '')] }); };
  const addColumn = () => {
    onUpdate({
      ...d,
      headers: [...headers, ''],
      rows: rows.map((r) => [...r, '']),
    });
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    onUpdate({ ...d, rows: rows.filter((_, i) => i !== idx) });
  };

  const removeColumn = (idx: number) => {
    if (headers.length <= 1) return;
    onUpdate({
      ...d,
      headers: headers.filter((_, i) => i !== idx),
      rows: rows.map((r) => r.filter((_, i) => i !== idx)),
    });
  };

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
          }}
        >
          <thead>
            <tr>
              {headers.map((h, ci) => (
                <th
                  key={ci}
                  style={{
                    border: '1px solid var(--color-border-subtle)',
                    padding: '6px',
                    background: 'var(--color-surface-secondary)',
                    position: 'relative',
                  }}
                >
                  <input
                    value={h}
                    onChange={(e) => { updateHeader(ci, e.target.value); }}
                    placeholder={`Column ${String(ci + 1)}`}
                    style={{
                      width: '100%',
                      border: 'none',
                      padding: '4px 6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      background: 'transparent',
                      outline: 'none',
                      fontFamily: 'inherit',
                      textAlign: 'center',
                    }}
                  />
                  {headers.length > 1 && (
                    <button
                      onClick={() => { removeColumn(ci); }}
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '2px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        fontSize: '10px',
                        padding: '1px',
                        opacity: 0.3,
                        lineHeight: 1,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose-500)'; e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.opacity = '0.3'; }}
                    >
                      ✕
                    </button>
                  )}
                </th>
              ))}
              <th
                style={{
                  border: 'none',
                  padding: '4px',
                  width: '28px',
                }}
              >
                <button
                  onClick={addColumn}
                  title="Add column"
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '1px dashed var(--color-border-subtle)',
                    borderRadius: '4px',
                    background: 'none',
                    color: 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-amber-500)'; e.currentTarget.style.color = 'var(--color-amber-500)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      border: '1px solid var(--color-border-subtle)',
                      padding: '4px',
                    }}
                  >
                    <input
                      value={cell}
                      onChange={(e) => { updateCell(ri, ci, e.target.value); }}
                      style={{
                        width: '100%',
                        border: 'none',
                        padding: '4px 6px',
                        fontSize: '11px',
                        color: 'var(--color-text-primary)',
                        background: 'transparent',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </td>
                ))}
                <td
                  style={{
                    border: 'none',
                    padding: '4px',
                    width: '28px',
                  }}
                >
                  {rows.length > 1 && (
                    <button
                      onClick={() => { removeRow(ri); }}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: '4px',
                        background: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        opacity: 0.3,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose-500)'; e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.opacity = '0.3'; }}
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={addRow}
          style={{
            padding: '6px 14px',
            border: '1px dashed var(--color-border-subtle)',
            borderRadius: '6px',
            background: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-amber-500)'; e.currentTarget.style.color = 'var(--color-amber-500)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
        >
          + Add Row
        </button>
        <input
          value={d.caption || ''}
          onChange={(e) => { onUpdate({ ...d, caption: e.target.value }); }}
          placeholder="Table caption..."
          style={{
            flex: 1,
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-secondary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  );
}
