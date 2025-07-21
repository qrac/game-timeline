import { BiX, BiImageAdd } from "react-icons/bi"

import type { Setting } from "../../types"
import { ComponentProgress } from "../progress"
import "./index.css"

export function ComponentBooth({
  setting,
  activeBulk,
  bulkProgress,
  filteredYearList,
  yearImages,
  createBulkImage,
  createYearImage,
  deleteYearImage,
}: {
  setting: Setting
  activeBulk: boolean
  bulkProgress: number
  filteredYearList: number[]
  yearImages: { [year: string]: string }
  createBulkImage: () => Promise<void>
  createYearImage: (year: number) => Promise<void>
  deleteYearImage: (year: number) => void
}) {
  const { isAppleMobile } = setting
  const completed = Object.keys(yearImages).length === filteredYearList.length
  return (
    <div className="booth-container">
      <div className="booth-docs">
        <p>
          <span>年ごとのスクリーンショットを生成できます。</span>
        </p>
        {isAppleMobile && <p>画像は長押しでカメラロールに保存可能です。</p>}
      </div>
      <div className="booth-items">
        {activeBulk && (
          <div className="booth-item is-desktop-only">
            <div className="booth-item-content">
              <ComponentProgress progress={bulkProgress} />
            </div>
          </div>
        )}
        {!completed && !activeBulk && (
          <div className="booth-item is-desktop-only">
            <div className="booth-item-content">
              <div className="booth-item-buttons">
                <button
                  className="button is-outline is-primary"
                  type="button"
                  onClick={createBulkImage}
                >
                  <BiImageAdd className="booth-item-button-icon" />
                  <span className="text">一括生成</span>
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="booth-item">
          {filteredYearList.map((year) => (
            <div key={year} className="booth-item-content">
              {yearImages[year] && (
                <div className="booth-item-stage">
                  <img src={yearImages[year]} alt={`Screenshot for ${year}`} />
                  <div className="booth-item-stage-over is-top-right">
                    <button
                      className="button is-outline is-square is-primary"
                      type="button"
                      onClick={() => deleteYearImage(year)}
                    >
                      <BiX className="booth-item-button-icon" />
                    </button>
                  </div>
                </div>
              )}
              {!yearImages[year] && (
                <div className="booth-item-buttons">
                  <button
                    className="button is-outline is-primary"
                    type="button"
                    onClick={() => createYearImage(year)}
                  >
                    <BiImageAdd className="booth-item-button-icon" />
                    <span className="text">{year}年</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
