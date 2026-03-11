import { useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { CONTENT_SCHEMAS, type ContentGroup, type CsvRow } from '../../data/schemas/contentSchemas';
import { seedContent } from '../../data/seed/seedContent';
import { csvToRows, downloadFile, rowsToCsv } from '../../lib/csv/csvUtils';
import type { AppState } from '../../lib/state/appState';

type Props = { state: AppState; setState: Dispatch<SetStateAction<AppState>> };

export const EditorMode = ({ state, setState }: Props) => {
  const [activeGroup, setActiveGroup] = useState<ContentGroup>(state.quickAdjust?.group ?? 'playerBoards');
  const [pasteBuffer, setPasteBuffer] = useState('');
  const fileInput = useRef<HTMLInputElement | null>(null);

  const rows = state.content[activeGroup];
  const schema = CONTENT_SCHEMAS[activeGroup];

  const setRows = (next: CsvRow<string>[]) => {
    setState((prev) => ({ ...prev, content: { ...prev.content, [activeGroup]: next }, dirty: { ...prev.dirty, [activeGroup]: true } }));
  };

  const importCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const nextRows = csvToRows(activeGroup, text);
      setRows(nextRows);
    }).catch((error: Error) => alert(error.message));
  };

  return (
    <div className="layout">
      <section className="panel">
        <h2>Content Groups</h2>
        {Object.keys(CONTENT_SCHEMAS).map((group) => (
          <button key={group} onClick={() => setActiveGroup(group as ContentGroup)} className={group === activeGroup ? 'active' : ''}>{CONTENT_SCHEMAS[group as ContentGroup].label}</button>
        ))}
      </section>

      <section className="panel editor-main">
        <h2>{schema.label}</h2>
        <div className="row">
          <button onClick={() => setRows([...rows, Object.fromEntries(schema.columns.map((col) => [col, '']))])}>Add Row</button>
          <button onClick={() => setRows(structuredClone(seedContent[activeGroup]))}>Reset Seed</button>
          <button onClick={() => downloadFile(`${activeGroup}.csv`, rowsToCsv(activeGroup, rows))}>Export CSV</button>
          <button onClick={() => {
            const payload = Object.entries(state.content).map(([group, values]) => `---${group}.csv---\n${rowsToCsv(group as ContentGroup, values)}`).join('\n\n');
            downloadFile('all-content.txt', payload, 'text/plain;charset=utf-8');
          }}>Export All CSVs</button>
          <button onClick={() => fileInput.current?.click()}>Import CSV</button>
          <input ref={fileInput} hidden type="file" accept=".csv,text/csv" onChange={importCsv} />
        </div>

        <table>
          <thead><tr><th>#</th>{schema.columns.map((column) => <th key={column}>{column}</th>)}<th>Actions</th></tr></thead>
          <tbody>
            {rows.map((row, idx) => {
              const errors = schema.validate?.(row) ?? [];
              return (
                <tr key={`${activeGroup}-${idx}`} className={errors.length ? 'error-row' : ''}>
                  <td>{idx + 1}</td>
                  {schema.columns.map((column) => (
                    <td key={`${idx}-${column}`}>
                      <input value={row[column] ?? ''} onChange={(e) => setRows(rows.map((entry, rowIdx) => rowIdx === idx ? { ...entry, [column]: e.target.value } : entry))} />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => setRows(rows.filter((_, rowIdx) => rowIdx !== idx))}>Delete</button>
                    <button onClick={() => setRows(rows.flatMap((entry, rowIdx) => rowIdx === idx ? [entry, { ...entry }] : [entry]))}>Duplicate</button>
                    <button onClick={() => idx > 0 && setRows(rows.map((entry, rowIdx) => rowIdx === idx - 1 ? rows[idx] : rowIdx === idx ? rows[idx - 1] : entry))}>↑</button>
                    <button onClick={() => idx < rows.length - 1 && setRows(rows.map((entry, rowIdx) => rowIdx === idx + 1 ? rows[idx] : rowIdx === idx ? rows[idx + 1] : entry))}>↓</button>
                    <button onClick={() => navigator.clipboard.writeText(JSON.stringify(row, null, 2))}>Copy JSON</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <h3>Paste Row JSON</h3>
        <textarea value={pasteBuffer} onChange={(e) => setPasteBuffer(e.target.value)} />
        <button onClick={() => {
          try {
            const parsed = JSON.parse(pasteBuffer) as CsvRow<string>;
            setRows([...rows, Object.fromEntries(schema.columns.map((column) => [column, parsed[column] ?? '']))]);
          } catch {
            alert('Invalid JSON');
          }
        }}>Paste Row</button>
      </section>
    </div>
  );
};
