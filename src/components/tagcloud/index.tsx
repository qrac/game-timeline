import clsx from "clsx"

import type { Term } from "../../types"
import "./index.css"

export function ComponentTagcloud({
  list,
  onToggle,
}: {
  list: Term[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="tagcloud">
      {list.map((term, index) => (
        <label
          key={index}
          className={clsx("button is-outline", term.filter && "is-active")}
        >
          <input
            className="input"
            type="checkbox"
            checked={term.filter}
            onChange={() => onToggle(term.id)}
          />
          <span className="checkbox" />
          <span className="text">{term.name}</span>
        </label>
      ))}
    </div>
  )
}
