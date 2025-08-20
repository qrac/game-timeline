import { useRef } from "react"
import { clsx } from "clsx"
import { BiDownload, BiUpload } from "react-icons/bi"

import type { Setting } from "../../types"
import { ComponentSelect } from "../select"
import { ComponentCheck } from "../check"
import { ComponentTagcloud } from "../tagcloud"
import { headerHeight } from "../../params"
import "./index.css"

export function ComponentSetting({
  setting,
  activeHeaderSearch,
  isMobileSidebar,
  changeSetting,
  changeItems,
  changeTerms,
}: {
  setting: Setting
  activeHeaderSearch: boolean
  isMobileSidebar?: boolean
  changeSetting: (newSetting: Partial<Setting>) => void
  changeItems: (e: React.ChangeEvent<HTMLInputElement>) => void
  changeTerms: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const {
    itemList,
    lankList,
    categoryList,
    tagList,
    yearList,
    startYear,
    endYear,
    omitEmptyYears,
    currentLank,
    hasLankNote,
    fullOpenLabels,
    staticHeader,
    hiddenController,
  } = setting

  const counts = {
    lank1Hardware:
      itemList.filter((item) => item.lank === 1 && item.category === "hardware")
        .length || 0,
    lank1Software:
      itemList.filter((item) => item.lank === 1 && item.category === "software")
        .length || 0,
    lank2Hardware:
      itemList.filter((item) => item.lank === 2 && item.category === "hardware")
        .length || 0,
    lank2Software:
      itemList.filter((item) => item.lank === 2 && item.category === "software")
        .length || 0,
    lank3Hardware:
      itemList.filter((item) => item.lank === 3 && item.category === "hardware")
        .length || 0,
    lank3Software:
      itemList.filter((item) => item.lank === 3 && item.category === "software")
        .length || 0,
  }
  const total = {
    lank2Hardware: counts.lank1Hardware + counts.lank2Hardware,
    lank2Software: counts.lank1Software + counts.lank2Software,
    lank3Hardware:
      counts.lank1Hardware + counts.lank2Hardware + counts.lank3Hardware,
    lank3Software:
      counts.lank1Software + counts.lank2Software + counts.lank3Software,
  }

  const changeItemsRef = useRef<HTMLInputElement>(null)
  const changeTermsRef = useRef<HTMLInputElement>(null)

  const handleChangeItems = () => {
    changeItemsRef.current?.click()
  }
  const handleChangeTerms = () => {
    changeTermsRef.current?.click()
  }
  return (
    <div
      className={clsx(
        "setting-container",
        isMobileSidebar && "is-mobile-sidebar"
      )}
    >
      <div className="setting-field">
        <h3 className="setting-field-title">表示する年</h3>
        <div className="setting-field-selects">
          <ComponentSelect
            value={startYear}
            onChange={(e) => {
              changeSetting({ startYear: Number(e.target.value) })
            }}
            list={yearList}
          />
          <p>to</p>
          <ComponentSelect
            value={endYear}
            onChange={(e) => {
              changeSetting({ endYear: Number(e.target.value) })
            }}
            list={yearList}
          />
        </div>
        <div className="setting-field-checks">
          <ComponentCheck
            checked={omitEmptyYears}
            onChange={(e) => {
              changeSetting({ omitEmptyYears: e.target.checked })
            }}
            text="データのない年を省略"
          />
        </div>
      </div>

      <div className="setting-field">
        <h3 className="setting-field-title">情報量</h3>
        <div className="setting-field-with">
          <ComponentSelect
            value={currentLank}
            onChange={(e) => {
              changeSetting({ currentLank: Number(e.target.value) })
            }}
            list={lankList}
          />
          {hasLankNote && (
            <p className="setting-field-note">
              {`【1】有名作品のみ`}
              <br className="setting-field-note-br is-wide-only" />
              <span className="setting-field-note-sep is-wide-none">／</span>
              {`ハードウェア（${counts.lank1Hardware}）, ソフトウェア（${counts.lank1Software}）`}
              <br />
              {`【2】推し作品含む`}
              <br className="setting-field-note-br is-wide-only" />
              <span className="setting-field-note-sep is-wide-none">／</span>
              {`ハードウェア（${total.lank2Hardware}）, ソフトウェア（${total.lank2Software}）`}
              <br />
              {`【3】全件表示`}
              <br className="setting-field-note-br is-wide-only" />
              <span className="setting-field-note-sep is-wide-none">／</span>
              {`ハードウェア（${total.lank3Hardware}）, ソフトウェア（${total.lank3Software}）`}
            </p>
          )}
        </div>
        <div className="setting-field-checks">
          <ComponentCheck
            checked={fullOpenLabels}
            onChange={(e) => {
              changeSetting({ fullOpenLabels: e.target.checked })
            }}
            text="マルチプラットフォームのラベルをすべて展開"
          />
        </div>
      </div>

      {categoryList.length > 0 && (
        <div className="setting-field">
          <h3 className="setting-field-title">カテゴリーフィルター</h3>
          <ComponentTagcloud
            list={categoryList}
            onToggle={(id) => {
              changeSetting({
                categoryList: categoryList.map((term) =>
                  term.id === id ? { ...term, filter: !term.filter } : term
                ),
              })
            }}
          />
        </div>
      )}

      {tagList.length > 0 && (
        <div className="setting-field">
          <h3 className="setting-field-title">タグフィルター</h3>
          <ComponentTagcloud
            list={tagList}
            onToggle={(id) => {
              changeSetting({
                tagList: tagList.map((term) =>
                  term.id === id ? { ...term, filter: !term.filter } : term
                ),
              })
            }}
          />
        </div>
      )}

      <div className="setting-field">
        <h3 className="setting-field-title">画面周り</h3>
        <div className="setting-field-checks">
          <ComponentCheck
            checked={staticHeader}
            onChange={(e) => {
              changeSetting({
                staticHeader: e.target.checked,
                headerHeight: (() => {
                  if (e.target.checked) return headerHeight.static
                  if (!e.target.checked && activeHeaderSearch)
                    return headerHeight.search
                  return headerHeight.default
                })(),
              })
            }}
            text="ヘッダーを固定しない"
          />
          <ComponentCheck
            checked={hiddenController}
            onChange={(e) => {
              changeSetting({ hiddenController: e.target.checked })
            }}
            text="移動ボタン類を隠す"
          />
        </div>
      </div>

      <div className="setting-field">
        <h3 className="setting-field-title">データの差し替え</h3>
        <div className="setting-field-buttons">
          <a
            href="/assets/items.csv"
            className="button is-outline is-square"
            download
          >
            <BiDownload className="setting-field-button-icon" />
          </a>
          <button
            type="button"
            className="button is-plain is-primary"
            onClick={handleChangeItems}
          >
            <BiUpload className="setting-field-button-icon" />
            <span className="text">ブラウザで開く</span>
          </button>
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            ref={changeItemsRef}
            onChange={changeItems}
          />
        </div>
      </div>

      <div className="setting-field">
        <h3 className="setting-field-title">カテゴリー・タグの差し替え</h3>
        <div className="setting-field-buttons">
          <a
            href="/assets/terms.csv"
            className="button is-outline is-square"
            download
          >
            <BiDownload className="setting-field-button-icon" />
          </a>
          <button
            type="button"
            className="button is-plain is-primary"
            onClick={handleChangeTerms}
          >
            <BiUpload className="setting-field-button-icon" />
            <span className="text">ブラウザで開く</span>
          </button>
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            ref={changeTermsRef}
            onChange={changeTerms}
          />
        </div>
      </div>
    </div>
  )
}
