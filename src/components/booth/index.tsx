import { BiX, BiTrash, BiImageAdd } from "react-icons/bi"

import type { Setting } from "../../types"
import { ComponentProgress } from "../progress"
import "./index.css"

export function ComponentBooth({
  setting,
  activeBulk,
  bulkProgress,
  cancelRef,
  filteredYearList,
  yearImages,
  createBulkImage,
  deleteBulkImage,
  createYearImage,
  deleteYearImage,
}: {
  setting: Setting
  activeBulk: boolean
  bulkProgress: number
  cancelRef: React.RefObject<boolean>
  filteredYearList: number[]
  yearImages: { [year: string]: string }
  createBulkImage: () => Promise<void>
  deleteBulkImage: () => void
  createYearImage: (year: number) => Promise<void>
  deleteYearImage: (year: number) => void
}) {
  const { isAppleMobile } = setting
  const completed = Object.keys(yearImages).length === filteredYearList.length
  const hasImages = Object.keys(yearImages).length > 0
  return (
    <div className="booth-container">
      <div className="booth-field">
        <div className="booth-field-docs">
          <p>
            <span>年ごとのスクリーンショットを生成できます。</span>
          </p>
          {isAppleMobile && <p>画像は長押しでカメラロールに保存可能です。</p>}
        </div>
      </div>
      {activeBulk && (
        <div className="booth-field">
          <div className="booth-field-content">
            <ComponentProgress progress={bulkProgress} />
          </div>
          <div className="booth-field-content">
            <div className="booth-field-buttons">
              <button
                className="button is-outline is-danger"
                onClick={() => {
                  cancelRef.current = true
                }}
              >
                <BiX className="booth-field-button-icon is-lg" />
                <span className="text">中断</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {!activeBulk && (
        <div className="booth-field">
          <h3 className="booth-field-title">一括処理</h3>
          <div className="booth-field-content">
            <div className="booth-field-buttons">
              {!completed && (
                <button
                  className="button is-outline is-primary"
                  type="button"
                  onClick={createBulkImage}
                >
                  <BiImageAdd className="booth-field-button-icon" />
                  <span className="text">生成</span>
                </button>
              )}
              {hasImages && (
                <button
                  className="button is-outline is-danger"
                  type="button"
                  onClick={deleteBulkImage}
                >
                  <BiTrash className="booth-field-button-icon" />
                  <span className="text">削除</span>
                </button>
              )}
            </div>
          </div>
          {!completed && (
            <div className="booth-field-docs is-mobile-only">
              <p className="text is-note">
                ※モバイル機での一括生成は負荷が大きいためご注意ください
              </p>
            </div>
          )}
        </div>
      )}
      <div className="booth-field">
        <h3 className="booth-field-title">個別処理</h3>
        {filteredYearList.map((year) => (
          <div key={year} className="booth-field-content">
            {yearImages[year] && (
              <div className="booth-field-stage">
                <img src={yearImages[year]} alt={`Screenshot for ${year}`} />
                <div className="booth-field-stage-delete">
                  <button
                    className="button is-outline is-square is-danger"
                    type="button"
                    onClick={() => deleteYearImage(year)}
                  >
                    <BiTrash className="booth-field-button-icon" />
                  </button>
                </div>
              </div>
            )}
            {!yearImages[year] && (
              <div className="booth-field-buttons">
                <button
                  className="button is-outline is-primary"
                  type="button"
                  onClick={() => createYearImage(year)}
                >
                  <BiImageAdd className="booth-field-button-icon" />
                  <span className="text">{year}年</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
