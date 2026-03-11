import { useEffect, useState } from 'react';
import './styles.css';
import { EditorMode } from './features/editor/EditorMode';
import { PlayMode } from './features/play/PlayMode';
import { RunMode } from './features/run/RunMode';
import { rowsToCsv, downloadFile } from './lib/csv/csvUtils';
import { createEncounter, loadState, saveState, type AppState } from './lib/state/appState';
import type { ContentGroup } from './data/schemas/contentSchemas';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const quickAdjust = (group: ContentGroup, rowIndex: number) => setState((prev) => ({ ...prev, mode: 'editor', quickAdjust: { group, rowIndex } }));
  const liveReload = () => setState((prev) => ({ ...prev, encounter: createEncounter(prev.content, prev.encounter.floor, prev.encounter.room) }));

  return (
    <main>
      <header>
        <h1>Pyramid Roguelite Prototype</h1>
        <div className="row">
          <button className={state.mode === 'play' ? 'active' : ''} onClick={() => setState((prev) => ({ ...prev, mode: 'play' }))}>Play Mode</button>
          <button className={state.mode === 'editor' ? 'active' : ''} onClick={() => setState((prev) => ({ ...prev, mode: 'editor' }))}>Content Editor</button>
          <button className={state.mode === 'run' ? 'active' : ''} onClick={() => setState((prev) => ({ ...prev, mode: 'run' }))}>Run / Floor</button>
          <button onClick={() => {
            const payload = Object.entries(state.content).map(([group, rows]) => `---${group}.csv---\n${rowsToCsv(group as ContentGroup, rows)}`).join('\n\n');
            downloadFile('all-csv-export.txt', payload, 'text/plain;charset=utf-8');
          }}>Export All CSVs</button>
        </div>
      </header>

      {state.mode === 'play' && <PlayMode state={state} setState={setState} onQuickAdjust={quickAdjust} onLiveReload={liveReload} />}
      {state.mode === 'editor' && <EditorMode state={state} setState={setState} />}
      {state.mode === 'run' && <RunMode state={state} setState={setState} />}
    </main>
  );
}
