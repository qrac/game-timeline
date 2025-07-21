import "./index.css"

export function ComponentProgress({ progress }: { progress: number }) {
  return (
    <div className="progress">
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-text">{progress}%</div>
    </div>
  )
}
