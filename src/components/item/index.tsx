import { useId } from "react"
import { clsx } from "clsx"
import { format } from "date-fns"
import { BiCaretRight, BiCaretLeft } from "react-icons/bi"

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
            tags.length > 0 && tags.map((tag) => `is-accent-${tag}`),
          )}
        />
      )}
      <div className="item-content">
        {labels.length > 0 && <ItemLabels labels={labels} tagList={tagList} />}
        <span className="item-name">{name}</span>
        <time className="item-date" dateTime={dateTime}>
          {dateStr}
        </time>
      </div>
    </div>
  )
}

function ItemLabels({
  labels,
  tagList,
}: {
  labels: string[]
  tagList: Term[]
}) {
  const fullOpenLabels = false
  const isMulti = labels.length > 1 && labels.includes("multi")
  const filteredLabels = isMulti
    ? labels.filter((label) => label !== "multi")
    : labels
  if (fullOpenLabels || !isMulti) {
    return (
      <ul className="item-labels">
        {filteredLabels.map((label) => (
          <ItemLabel key={label} label={label} tagList={tagList} />
        ))}
      </ul>
    )
  }
  const uid = useId()
  return (
    <>
      <input
        type="checkbox"
        className="input is-hidden"
        id={"item-labels-" + uid}
      />
      <ul className="item-labels">
        <ItemLabel label="multi" tagList={tagList} />
        <li className="item-label-control is-open">
          <label htmlFor={"item-labels-" + uid}>
            <span className="text">詳細</span>
            <BiCaretRight />
          </label>
        </li>
        {filteredLabels.map((label) => (
          <ItemLabel key={label} label={label} tagList={tagList} />
        ))}
        <li className="item-label-control is-close">
          <label htmlFor={"item-labels-" + uid}>
            <BiCaretLeft />
            <span className="text">閉じる</span>
          </label>
        </li>
      </ul>
    </>
  )
}

function ItemLabel({ label, tagList }: { label: string; tagList: Term[] }) {
  const tag = tagList.find((tag) => tag.id === label)
  const tagLabel = tag ? tag.label : label
  return (
    <li className={clsx("item-label", `is-accent-${label}`)}>{tagLabel}</li>
  )
}
