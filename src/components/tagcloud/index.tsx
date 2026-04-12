import clsx from "clsx"

import type { Term } from "../../types"
import "./index.css"

export function ComponentTagcloud({
  list,
  selectedIds,
  onToggle,
}: {
  list: Term[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="tagcloud">
      {list.map((term, index) => (
        <label
          key={index}
          className={clsx(
            "button is-outline",
            selectedIds.includes(term.id) && "is-active",
          )}
        >
          <input
            className="input"
            type="checkbox"
            checked={selectedIds.includes(term.id)}
            onChange={() => onToggle(term.id)}
          />
          <span className="checkbox" />
          <span className="text">{term.name}</span>
        </label>
      ))}
    </div>
  )
}
