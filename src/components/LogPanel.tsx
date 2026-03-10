export function LogPanel({ log }: { log: string[] }) {
  return (
    <section className="panel log">
      <h3>Log</h3>
      {log.slice(0, 12).map((line, idx) => <div key={`${idx}-${line}`}>{line}</div>)}
    </section>
  );
}
