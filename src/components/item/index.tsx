import { clsx } from "clsx"
import { format } from "date-fns"

import type { Item, Term } from "../../types"
import "./index.css"

export function ComponentItem({
  item,
  tagList,
}: {
  item: Item
  tagList: Term[]
}) {
  let dateTime = format(new Date(item.timestamp), "yyyy-MM-dd")
  let dateStr = format(new Date(item.timestamp), "yyyy年M月d日")

  if (!item.hasDay) {
    dateTime = format(new Date(item.timestamp), "yyyy-MM")
    dateStr = format(new Date(item.timestamp), "yyyy年M月")
  }
  if (!item.hasMonth) {
    dateTime = format(new Date(item.timestamp), "yyyy")
    dateStr = format(new Date(item.timestamp), "yyyy年")
  }
  return (
    <div className={clsx("item", `is-category-${item.category}`)}>
      {item.category === "hardware" && (
        <div
          className={clsx(
            "item-bar",
            item.tags.length > 0 && item.tags.map((tag) => `is-accent-${tag}`)
          )}
        />
      )}
      <div className="item-content">
        <h3 className="item-name">{item.name}</h3>
        <div className="item-info">
          {item.labels.length > 0 && (
            <ul className="item-labels">
              {item.labels.map((label) => {
                const tag = tagList.find((tag) => tag.id === label)
                const tagLabel = tag ? tag.label : label
                return (
                  <li
                    className={clsx("item-label", `is-accent-${label}`)}
                    key={label}
                  >
                    {tagLabel}
                  </li>
                )
              })}
            </ul>
          )}
          <time className="item-date" dateTime={dateTime}>
            {dateStr}
          </time>
        </div>
      </div>
    </div>
  )
}
