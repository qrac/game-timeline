import { useState, useRef, useEffect } from "react"
import { clsx } from "clsx"
import {
  BiArrowToLeft,
  BiMinusCircle,
  BiPlusCircle,
  BiArrowToRight,
} from "react-icons/bi"

import type { Setting } from "../../types"
import { ComponentItem } from "../item"
import {
  filterItemList,
  getYearList,
  getYearListFromEdges,
  filterYearList,
  scrollToY,
} from "../../utils"
import "./index.css"

export function ComponentTimeline({
  setting,
  activeTimeline,
}: //ref,
{
  setting: Setting
  activeTimeline: boolean
  //ref: React.Ref<HTMLDivElement>
}) {
  const {
    itemList,
    categoryList,
    tagList,
    currentLank,
    visibleController,
    scrollOffset,
  } = setting
  const filteredItemList = filterItemList(
    itemList,
    categoryList,
    tagList,
    currentLank
  )
  const yearList = getYearList(filteredItemList)
  const { startYear, endYear, omitEmptyYears } = setting
  const itemStartYear = Math.min(...yearList)
  const itemEndYear = Math.max(...yearList)
  const maxStartYear = Math.max(startYear, itemStartYear)
  const minEndYear = Math.min(endYear, itemEndYear)
  const visibleYearList = omitEmptyYears
    ? filterYearList(yearList, maxStartYear, minEndYear)
    : getYearListFromEdges(maxStartYear, minEndYear)

  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [inputYear, setInputYear] = useState<number | "">(currentYear)
  const yearRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const isScrollingRef = useRef(false)

  const scrollToYear = (year: number) => {
    const el = yearRefs.current.get(year)
    if (el) {
      const rect = el.getBoundingClientRect()
      const offsetTop = window.pageYOffset + rect.top
      const targetY = offsetTop - scrollOffset

      isScrollingRef.current = true

      scrollToY(targetY, 500)

      setCurrentYear(year)
      setInputYear(year)

      setTimeout(() => {
        isScrollingRef.current = false
      }, 500)
    }
  }

  const changeInputYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const num = Number(val)

    if (val === "") {
      setInputYear("")
    } else {
      setInputYear(num)
      if (visibleYearList.includes(num)) {
        scrollToYear(num)
      }
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return

        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length === 0) return
        const topMost = visible.reduce((prev, curr) =>
          prev.boundingClientRect.top < curr.boundingClientRect.top
            ? prev
            : curr
        )
        const yearStr = topMost.target.getAttribute("id")
        const year = yearStr ? Number(yearStr) : null
        if (year && year !== currentYear) {
          setCurrentYear(year)
          setInputYear(year)
        }
      },
      {
        root: null,
        rootMargin: `-${scrollOffset}px 0px -40% 0px`,
        threshold: 0,
      }
    )
    visibleYearList.forEach((year) => {
      const el = yearRefs.current.get(year)
      if (el) {
        observer.observe(el)
      }
    })
    return () => observer.disconnect()
  }, [visibleYearList, scrollOffset])
  return (
    <main className="timeline">
      <div
        className={clsx("timeline-container", activeTimeline && "is-active")}
        //ref={ref}
      >
        {filteredItemList.length > 0 ? (
          <div className="timeline-contents">
            <div className="timeline-bar" />
            <div className="timeline-years">
              {visibleYearList.map((year) => {
                const mainItemList = filteredItemList
                  .filter((item) => {
                    return item.year === year && item.category !== "news"
                  })
                  .sort((a, b) => a.timestamp - b.timestamp)
                const subItemList = filteredItemList
                  .filter((item) => {
                    return item.year === year && item.category === "news"
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
                    <h2
                      className="timeline-year-title"
                      id={year.toString()}
                      ref={(el) => {
                        if (el) yearRefs.current.set(year, el)
                      }}
                    >
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

      {visibleController && (
        <div className="timeline-controller">
          <div className="timeline-controls">
            <button
              className="button is-melt"
              onClick={() => scrollToYear(visibleYearList[0])}
            >
              <BiArrowToLeft className="timeline-control-icon" />
            </button>
            <button
              className="button is-melt"
              onClick={() => {
                const idx = visibleYearList.indexOf(currentYear)
                if (idx > 0) scrollToYear(visibleYearList[idx - 1])
              }}
            >
              <BiMinusCircle className="timeline-control-icon" />
            </button>
            <input
              type="number"
              className="input is-inside is-center is-year"
              value={inputYear ?? ""}
              onChange={changeInputYear}
            />
            <button
              className="button is-melt"
              onClick={() => {
                const idx = visibleYearList.indexOf(currentYear)
                if (idx < visibleYearList.length - 1)
                  scrollToYear(visibleYearList[idx + 1])
              }}
            >
              <BiPlusCircle className="timeline-control-icon" />
            </button>
            <button
              className="button is-melt"
              onClick={() => scrollToYear(visibleYearList.at(-1)!)}
            >
              <BiArrowToRight className="timeline-control-icon" />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
