import { clsx } from "clsx"

import type { Item, Term, Options } from "../../types"
import { ComponentItem } from "../item"
import {
  filterItemList,
  getYearList,
  getYearListFromEdges,
  filterYearList,
} from "../../utils"
import "./index.css"

export function ComponentTimeline({
  itemList,
  categoryList,
  tagList,
  options,
  activeTimeline,
  ref,
}: {
  itemList: Item[]
  categoryList: Term[]
  tagList: Term[]
  options: Options
  activeTimeline: boolean
  ref: React.Ref<HTMLDivElement>
}) {
  const filteredItemList = filterItemList(itemList, categoryList, tagList)
  const yearList = getYearList(filteredItemList)
  const { startYear, endYear, omitEmptyYears } = options
  const itemStartYear = Math.min(...yearList)
  const itemEndYear = Math.max(...yearList)
  const maxStartYear = Math.max(startYear, itemStartYear)
  const minEndYear = Math.min(endYear, itemEndYear)
  const visibleYearList = omitEmptyYears
    ? filterYearList(yearList, maxStartYear, minEndYear)
    : getYearListFromEdges(maxStartYear, minEndYear)
  return (
    <main className="timeline">
      <div
        className={clsx("timeline-container", activeTimeline && "is-active")}
        ref={ref}
      >
        {filteredItemList.length > 0 ? (
          <div className="timeline-contents">
            <div className="timeline-bar" />
            <div className="timeline-years">
              {visibleYearList.map((year) => {
                const mainItemList = filteredItemList
                  .filter((item) => {
                    return (
                      item.year === year &&
                      item.category !== "news" &&
                      item.lank <= options.visibleLank
                    )
                  })
                  .sort((a, b) => a.timestamp - b.timestamp)
                const subItemList = filteredItemList
                  .filter((item) => {
                    return (
                      item.year === year &&
                      item.category === "news" &&
                      item.lank <= options.visibleLank
                    )
                  })
                  .sort((a, b) => a.timestamp - b.timestamp)
                const emptyMain = mainItemList.length === 0
                const emptySub = subItemList.length === 0
                const emptyItems = emptyMain && emptySub

                if (emptyItems && omitEmptyYears) {
                  return null
                }
                return (
                  <div className="timeline-year" key={year}>
                    <h2 className="timeline-year-title">
                      <span className="timeline-year-title-text">{year}</span>
                    </h2>
                    {!emptyItems && (
                      <div
                        className={clsx(
                          "timeline-year-columns",
                          emptySub && "is-empty-sub"
                        )}
                      >
                        <div
                          className={clsx(
                            "timeline-year-column is-main",
                            mainItemList.length >= 2 && "is-separate"
                          )}
                        >
                          {mainItemList.map((item) => (
                            <ComponentItem
                              key={item.name}
                              item={item}
                              tagList={tagList}
                            />
                          ))}
                        </div>
                        {subItemList.length > 0 && (
                          <div
                            className={clsx(
                              "timeline-year-column is-sub",
                              subItemList.length >= 2 && "is-separate"
                            )}
                          >
                            {subItemList.map((item) => (
                              <ComponentItem
                                key={item.name}
                                item={item}
                                tagList={tagList}
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
          </div>
        ) : (
          <div className="timeline-blank">表示するデータがないよ！</div>
        )}
      </div>
    </main>
  )
}
