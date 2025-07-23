import { clsx } from "clsx"
import { BiX, BiTrash, BiImageAdd, BiDownload } from "react-icons/bi"

import type { Setting, Image } from "../../types"
import { ComponentProgress } from "../progress"
import { maxMergedHeight } from "../../params"
import { formatSize } from "../../utils"
import "./index.css"

export function ComponentBooth({
  setting,
  activeBulk,
  bulkProgress,
  cancelRef,
  filteredYearList,
  yearImages,
  mergedImage,
  mergeYears,
  createBulkImage,
  deleteBulkImage,
  createYearImage,
  deleteYearImage,
  createMergedImage,
  deleteMergedImage,
  toggleAllMergeYears,
  toggleMergeYear,
}: {
  setting: Setting
  activeBulk: boolean
  bulkProgress: number
  cancelRef: React.RefObject<boolean>
  filteredYearList: number[]
  yearImages: { [year: string]: Image }
  mergedImage: Image | null
  mergeYears: number[]
  createBulkImage: () => Promise<void>
  deleteBulkImage: () => void
  createYearImage: (year: number) => Promise<void>
  deleteYearImage: (year: number) => void
  createMergedImage: () => Promise<void>
  deleteMergedImage: () => void
  toggleAllMergeYears: () => void
  toggleMergeYear: (year: number) => void
}) {
  const { isAppleMobile } = setting
  const completed = Object.keys(yearImages).length === filteredYearList.length
  const hasImages = Object.keys(yearImages).length > 0

  const filteredImages = Object.entries(yearImages)
    .filter(([year]) => mergeYears.includes(Number(year)))
    .map(([_, image]) => image)
  const allMergeChecked = mergeYears.length === Object.keys(yearImages).length
  const preMergedWidth = Object.values(yearImages)[0]?.width || 0
  const preMergedHeight =
    filteredImages.reduce((sum, img) => sum + img.height, 0) || 0
  const preMergedImage: Image = {
    url: "",
    width: preMergedWidth,
    height: preMergedHeight,
    size: 0,
  }
  const exceededHeight = preMergedHeight > maxMergedHeight
  const canMerge =
    !exceededHeight && filteredImages.length > 0 && mergeYears.length >= 2
  return (
    <div className="booth-container">
      <div className="booth-field">
        <div className="booth-field-docs">
          <p>
            <span>年ごとのスクリーンショットを生成・結合できます。</span>
          </p>
          {isAppleMobile && <p>画像は長押しでカメラロールに保存可能です。</p>}
        </div>
      </div>

      <div className="booth-field">
        {activeBulk && (
          <>
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
          </>
        )}
        {!activeBulk && (
          <>
            <h3 className="booth-field-title">一括処理</h3>
            <div className="booth-field-content">
              <div className="booth-field-buttons">
                <button
                  className="button is-outline is-primary"
                  type="button"
                  disabled={completed}
                  onClick={createBulkImage}
                >
                  <BiImageAdd className="booth-field-button-icon" />
                  <span className="text">まとめて生成</span>
                </button>
              </div>
            </div>
            <div className="booth-field-content">
              <div className="booth-field-buttons">
                <button
                  className="button is-outline is-danger"
                  type="button"
                  disabled={!hasImages}
                  onClick={deleteBulkImage}
                >
                  <BiTrash className="booth-field-button-icon" />
                  <span className="text">まとめて削除</span>
                </button>
              </div>
            </div>
          </>
        )}
        <div className="booth-field-docs is-mobile-only">
          <p className="text is-note">
            ※モバイル端末での一括生成は負荷が大きいためご注意ください
          </p>
        </div>
      </div>

      <div className="booth-field">
        <h3 className="booth-field-title">個別処理</h3>
        {filteredYearList.map((year) => (
          <div key={year} className="booth-field-content">
            {yearImages[year] && (
              <BoothFieldStage
                year={year}
                image={yearImages[year]}
                hasDownload={!isAppleMobile}
                onDelete={() => deleteYearImage(year)}
              />
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

      <div className="booth-field">
        <h3 className="booth-field-title">結合処理</h3>
        <div className="booth-field-docs">
          <p>
            生成したスクリーンショットを縦に合計{maxMergedHeight}
            pxまで繋げることができます。
          </p>
        </div>
        <div className="booth-field-content">
          <div className="booth-field-content-card">
            {mergedImage ? (
              <BoothFieldStage
                year="merged"
                image={mergedImage}
                hasDownload={!isAppleMobile}
                onDelete={deleteMergedImage}
              />
            ) : (
              <BoothFieldStage
                year="merged"
                image={preMergedImage}
                hasDownload={false}
                exceededHeight={exceededHeight}
              />
            )}
            <div className="booth-field-content-card-inner">
              {Object.keys(yearImages).length > 0 && (
                <div className="booth-field-checks">
                  <div className="booth-field-checks-all">
                    <label className="button is-outline">
                      <input
                        className="input"
                        type="checkbox"
                        checked={
                          mergeYears.length === Object.keys(yearImages).length
                        }
                        onChange={toggleAllMergeYears}
                      />
                      <span className="checkbox" />
                      <span className="text">
                        {allMergeChecked ? "すべて解除" : "すべて選択"}
                      </span>
                    </label>
                  </div>
                  <div className="booth-field-checks-children">
                    {Object.keys(yearImages).map((year) => (
                      <label className="booth-field-checks-child" key={year}>
                        <input
                          className="input"
                          type="checkbox"
                          checked={mergeYears.includes(Number(year))}
                          onChange={() => toggleMergeYear(Number(year))}
                        />
                        <span className="checkbox" />
                        <span className="text">{year}年</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="booth-field-buttons">
                <button
                  className="button is-outline is-primary"
                  type="button"
                  disabled={!canMerge || activeBulk}
                  onClick={createMergedImage}
                >
                  <BiImageAdd className="booth-field-button-icon" />
                  <span className="text">結合</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BoothFieldStage({
  year,
  image,
  hasDownload,
  exceededHeight,
  onDelete,
}: {
  year: number | string
  image: Image
  hasDownload: boolean
  exceededHeight?: boolean
  onDelete?: () => void
}) {
  const size = image.size ? formatSize(image.size) : null

  function BadgeMeta() {
    return (
      <div className="booth-field-stage-badge-meta">
        <p className="booth-field-stage-badge-meta-text">
          <span className="text">{image.width}</span>
          <span className="text"> x </span>
          <span className={clsx("text", exceededHeight && "is-exceeded")}>
            {image.height}
          </span>
          <span className="text"> px</span>
        </p>
        {size && <p className="booth-field-stage-badge-meta-text">{size}</p>}
      </div>
    )
  }
  function Delete() {
    return (
      <div className="booth-field-stage-delete">
        <button
          className="button is-outline is-square is-danger"
          type="button"
          onClick={onDelete}
        >
          <BiTrash className="booth-field-button-icon" />
        </button>
      </div>
    )
  }
  return (
    <div className="booth-field-stage">
      {image.url && <img src={image.url} alt={`Screenshot for ${year}`} />}
      {hasDownload ? (
        <a
          href={image.url}
          download={`game-timeline-screenshot-${year}.png`}
          className="booth-field-stage-badge"
        >
          <div className="booth-field-stage-badge-icon-wrap">
            <BiDownload className="booth-field-stage-badge-icon" />
          </div>
          <BadgeMeta />
        </a>
      ) : (
        <div className="booth-field-stage-badge">
          <BadgeMeta />
        </div>
      )}
      {image.url && onDelete && <Delete />}
    </div>
  )
}
