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
  const { name, date, category, tags, labels } = item

  let dateTime = format(new Date(date.timestamp), "yyyy-MM-dd")
  let dateStr = format(new Date(date.timestamp), "yyyy年M月d日")

  if (!date.hasDay) {
    dateTime = format(new Date(date.timestamp), "yyyy-MM")
    dateStr = format(new Date(date.timestamp), "yyyy年M月")
  }
  if (!date.hasMonth) {
    dateTime = format(new Date(date.timestamp), "yyyy")
    dateStr = format(new Date(date.timestamp), "yyyy年")
  }
  return (
    <div className={clsx("item", `is-category-${category}`)}>
      {category === "hardware" && (
        <div
          className={clsx(
            "item-bar",
            tags.length > 0 && tags.map((tag) => `is-accent-${tag}`)
          )}
        />
      )}
      <div className="item-content">
        <h3 className="item-name">{name}</h3>
        <div className="item-info">
          {labels.length > 0 && (
            <ul className="item-labels">
              {labels.map((label) => {
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
