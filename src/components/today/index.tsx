import { parseISO, format, addDays, subDays } from "date-fns"
import { BiRevision, BiChevronLeft, BiChevronRight } from "react-icons/bi"

import type { Setting } from "../../types"
import { ComponentItem } from "../item"
import { filterDateItemList } from "../../utils"
import "./index.css"

export function ComponentToday({
  setting,
  changeCurrentDate,
  resetCurrentDate,
}: {
  setting: Setting
  changeCurrentDate: (dateValue: string) => void
  resetCurrentDate: () => void
}) {
  const { itemList, tagList, currentDate } = setting
  const filteredItemList = filterDateItemList(itemList, currentDate)
    .filter((item) => item.category !== "news")
    .sort((a, b) => a.date.timestamp - b.date.timestamp)
  const handlePrevDay = () => {
    const prev = subDays(parseISO(currentDate.value), 1)
    changeCurrentDate(format(prev, "yyyy-MM-dd"))
  }
  const handleNextDay = () => {
    const next = addDays(parseISO(currentDate.value), 1)
    changeCurrentDate(format(next, "yyyy-MM-dd"))
  }
  return (
    <div className="today-container">
      <div className="today-header">
        <h3 className="today-header-title">
          <span className="today-header-title-sub">{currentDate.year}</span>
          <span className="today-header-title-main">
            {currentDate.month}.{currentDate.day}
          </span>
        </h3>
      </div>
      {filteredItemList.length > 0 ? (
        <div className="today-items">
          {filteredItemList.map((item, index) => (
            <div key={index} className="today-item">
              <p className="today-item-label">
                <span className="today-item-label-main">
                  {currentDate.year - item.date.year}
                </span>
                <span className="today-item-label-sub">周年</span>
              </p>
              <ComponentItem item={item} tagList={tagList} />
            </div>
          ))}
        </div>
      ) : (
        <p className="today-empty">この日のデータがないよ！</p>
      )}
      <div className="today-bottom">
        <p className="today-bottom-text">
          日付を変更して別の日を確認できます。
        </p>
        <div className="today-bottom-input-set">
          <div className="joint">
            <button
              className="button is-outline is-square"
              onClick={handlePrevDay}
            >
              <BiChevronLeft className="today-bottom-button-icon" />
            </button>
            <input
              className="input"
              type="date"
              value={currentDate.value}
              onChange={(e) => changeCurrentDate(e.target.value)}
            />
            <button
              className="button is-outline is-square"
              onClick={handleNextDay}
            >
              <BiChevronRight className="today-bottom-button-icon" />
            </button>
          </div>
          <button
            className="button is-outline is-square"
            onClick={resetCurrentDate}
          >
            <BiRevision className="today-bottom-button-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}
