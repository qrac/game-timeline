import { useState, useRef, useEffect } from "react"
import { clsx } from "clsx"
import {
  BiCalendar,
  BiArrowToLeft,
  BiChevronLeftCircle,
  BiChevronRightCircle,
  BiArrowToRight,
} from "react-icons/bi"

import type { Setting, Item } from "../../types"
import { ComponentItem } from "../item"
import { scrollToY } from "../../utils"
import "./index.css"

export function ComponentTimeline({
  setting,
  activeTimeline,
  yearAreaRefs,
  filteredItemList,
  filteredYearList,
  openModal,
}: {
  setting: Setting
  activeTimeline: boolean
  yearAreaRefs: React.RefObject<Map<number, HTMLDivElement>>
  filteredItemList: Item[]
  filteredYearList: number[]
  openModal: (modalId: string) => void
}) {
  const {
    omitEmptyYears,
    todayDate,
    todayItemCount,
    hiddenController,
    headerHeight,
    timelineOffset,
  } = setting

  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [inputYear, setInputYear] = useState<number | "">(currentYear)

  const yearHeadingRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const isScrollingRef = useRef(false)
  const scrollOffset = headerHeight + timelineOffset

  const scrollToYear = (year: number) => {
    const el = yearHeadingRefs.current.get(year)
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
      if (filteredYearList.includes(num)) {
        scrollToYear(num)
      }
    }
  }

  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return

      const visible = entries.filter((entry) => entry.isIntersecting)
      if (visible.length === 0) return
      const topMost = visible.reduce((prev, curr) =>
        prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
      )
      const yearStr = topMost.target.getAttribute("id")
      const year = yearStr ? Number(yearStr) : null
      if (year && year !== currentYear) {
        setCurrentYear(year)
        setInputYear(year)
      }
    }
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: `-${scrollOffset}px 0px -40% 0px`,
      threshold: 0,
    })
    filteredYearList.forEach((year) => {
      const el = yearHeadingRefs.current.get(year)
      if (el) {
        observer.observe(el)
      }
    })
    return () => observer.disconnect()
  }, [filteredYearList, scrollOffset])
  return (
    <main className="timeline">
      <div
        className={clsx("timeline-container", activeTimeline && "is-active")}
      >
        <div className="timeline-today">
          <button
            className="timeline-today-button"
            onClick={() => openModal("today")}
          >
            <BiCalendar className="timeline-today-button-icon" />
            <span className="timeline-today-button-text">
              <span className="text">今日</span>
              <span className="text">
                （{todayDate.month}月{todayDate.day}日）
              </span>
              <span className="text">は何の日？</span>
            </span>
            {todayItemCount > 0 && (
              <span className="timeline-today-button-count">
                {todayItemCount}
              </span>
            )}
          </button>
        </div>
        {filteredItemList.length > 0 ? (
          <div className="timeline-years">
            {filteredYearList.map((year, index) => {
              const isFirstYear = index === 0
              const isLastYear = index === filteredYearList.length - 1

              const mainItemList = filteredItemList
                .filter((item) => {
                  return item.date.year === year && item.category !== "news"
                })
                .sort((a, b) => a.date.timestamp - b.date.timestamp)
              const subItemList = filteredItemList
                .filter((item) => {
                  return item.date.year === year && item.category === "news"
                })
                .sort((a, b) => a.date.timestamp - b.date.timestamp)
              const emptyMain = mainItemList.length === 0
              const emptySub = subItemList.length === 0
              const emptyItems = emptyMain && emptySub

              if (emptyItems && omitEmptyYears) {
                return null
              }
              return (
                <div
                  className={clsx(
                    "timeline-year",
                    isFirstYear && "is-first",
                    isLastYear && "is-last",
                    emptyItems && "is-empty"
                  )}
                  key={year}
                  ref={(el) => {
                    if (el) yearAreaRefs.current.set(year, el)
                  }}
                >
                  <h2
                    className="timeline-year-title"
                    id={year.toString()}
                    ref={(el) => {
                      if (el) yearHeadingRefs.current.set(year, el)
                    }}
                  >
                    <span className="timeline-year-title-text">{year}</span>
                  </h2>
                  <div className="timeline-year-bar" />
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
                        {mainItemList.map((item, index) => (
                          <ComponentItem
                            key={index}
                            item={item}
                            setting={setting}
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
                          {subItemList.map((item, index) => (
                            <ComponentItem
                              key={index}
                              item={item}
                              setting={setting}
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

      <div
        className={clsx(
          "timeline-spacer",
          !hiddenController && activeTimeline && "is-active"
        )}
      />

      <div
        className={clsx(
          "timeline-controller",
          !hiddenController && activeTimeline && "is-active"
        )}
      >
        <div className="timeline-controls">
          <button
            className="button is-melt"
            onClick={() => scrollToYear(filteredYearList[0])}
          >
            <BiArrowToLeft className="timeline-control-icon" />
          </button>
          <button
            className="button is-melt"
            onClick={() => {
              const idx = filteredYearList.indexOf(currentYear)
              if (idx > 0) scrollToYear(filteredYearList[idx - 1])
            }}
          >
            <BiChevronLeftCircle className="timeline-control-icon" />
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
              const idx = filteredYearList.indexOf(currentYear)
              if (idx < filteredYearList.length - 1)
                scrollToYear(filteredYearList[idx + 1])
            }}
          >
            <BiChevronRightCircle className="timeline-control-icon" />
          </button>
          <button
            className="button is-melt"
            onClick={() => scrollToYear(filteredYearList.at(-1)!)}
          >
            <BiArrowToRight className="timeline-control-icon" />
          </button>
        </div>
      </div>
    </main>
  )
}
