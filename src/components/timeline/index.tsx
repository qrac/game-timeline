import { clsx } from "clsx"

import type { Item, Term } from "../../types"
import { ComponentItem } from "../item"
import "./index.css"

export function ComponentTimeline({
  items,
  tags,
  selectedCategoryIds,
  selectedTagIds,
}: {
  items: Item[]
  tags: Term[]
  selectedCategoryIds: string[]
  selectedTagIds: string[]
}) {
  const isSeparateMain = true
  const filteredItemList = items.filter((item) => {
    const categoryMatched = selectedCategoryIds.length
      ? selectedCategoryIds.includes(item.category)
      : true
    const tagMatched = selectedTagIds.length
      ? item.tags.some((tag) => selectedTagIds.includes(tag)) ||
        item.labels.some((label) => selectedTagIds.includes(label))
      : true
    return categoryMatched && tagMatched
  })
  const filteredYearList = [
    ...new Set(filteredItemList.map((item) => item.date.year)),
  ].sort((a, b) => a - b)
  return (
    <div className="timeline">
      <div className="timeline-container">
        {filteredItemList.length > 0 ? (
          <div className="timeline-years">
            {filteredYearList.map((year, index) => {
              const isFirstYear = index === 0
              const isLastYear = index === filteredYearList.length - 1

              const hardwareItemList = filteredItemList
                .filter((item) => {
                  return item.date.year === year && item.category === "hardware"
                })
                .sort((a, b) => a.date.timestamp - b.date.timestamp)
              const softwareItemList = filteredItemList
                .filter((item) => {
                  return item.date.year === year && item.category === "software"
                })
                .sort((a, b) => a.date.timestamp - b.date.timestamp)

              const mainItemList = isSeparateMain
                ? [...hardwareItemList, ...softwareItemList]
                : [...hardwareItemList, ...softwareItemList].sort(
                    (a, b) => a.date.timestamp - b.date.timestamp,
                  )
              const subItemList = filteredItemList
                .filter((item) => {
                  return item.date.year === year && item.category === "news"
                })
                .sort((a, b) => a.date.timestamp - b.date.timestamp)

              const emptyMain = mainItemList.length === 0
              const emptySub = subItemList.length === 0
              const emptyItems = emptyMain && emptySub

              if (emptyItems) {
                return null
              }
              return (
                <div
                  className={clsx(
                    "timeline-year",
                    isFirstYear && "is-first",
                    isLastYear && "is-last",
                    emptyItems && "is-empty",
                    isSeparateMain && "is-separate-main",
                  )}
                  key={year}
                >
                  <h2 className="timeline-year-title" id={year.toString()}>
                    <span className="timeline-year-title-text">{year}</span>
                  </h2>
                  <div className="timeline-year-bar" />
                  {!emptyItems && (
                    <div
                      className={clsx(
                        "timeline-year-columns",
                        emptySub && "is-empty-sub",
                      )}
                    >
                      {mainItemList.length > 0 && (
                        <div
                          className={clsx(
                            "timeline-year-column is-main",
                            mainItemList.length >= 2 && "is-separate",
                          )}
                        >
                          {mainItemList.map((item, index) => (
                            <ComponentItem
                              key={index}
                              item={item}
                              tagList={tags}
                            />
                          ))}
                        </div>
                      )}
                      {subItemList.length > 0 && (
                        <div
                          className={clsx(
                            "timeline-year-column is-sub",
                            subItemList.length >= 2 && "is-separate",
                          )}
                        >
                          {subItemList.map((item, index) => (
                            <ComponentItem
                              key={index}
                              item={item}
                              tagList={tags}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="timeline-blank">表示するデータがないよ！</div>
        )}
      </div>
    </div>
  )
}
