import { useEffect } from "react"
import { clsx } from "clsx"
import { BiHelpCircle, BiSearchAlt, BiImages, BiCog, BiX } from "react-icons/bi"

import type { Setting } from "../../types"
import "./index.css"

export function ComponentHeader({
  setting,
  activeHeaderSearch,
  headerSearchRef,
  activeModal,
  changeHeaderSearch,
  changeSearchText,
  openModal,
}: {
  setting: Setting
  activeHeaderSearch: boolean
  headerSearchRef: React.RefObject<HTMLInputElement>
  activeModal: string
  changeHeaderSearch: () => void
  changeSearchText: (text: string) => void
  openModal: (modalId: string) => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeHeaderSearch && activeModal === null) {
        e.preventDefault()
        changeHeaderSearch()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [changeHeaderSearch])
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-contents">
          <h1 className="header-title">
            <svg
              className="header-title-icon"
              viewBox="0 0 460 360"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m440 80h-30-20v20h-10v-20h-20v-20h-20-20v-40-20h-20-30-20v20 40h-40v-40-20h-20-30-20v20 40h-20-20v20h-20v20h-10v-20h-20-30-20v20 90 20h20 10v10 20h20 10v20 20h20 40v10h-10-20v20 30 20h20 30 20v-20-10h30 20v-20-30h40v30 20h20 30v10 20h20 30 20v-20-30-20h-20-10v-10h40 20v-20-20h10 20v-20-10h10 20v-20-90-20z" />
              <g fill="#8766b6">
                <path d="m320 310h30v30h-30z" />
                <path d="m110 310h30v30h-30z" />
                <path d="m20 100h30v90h-30z" />
                <path d="m380 120h-20v-20h-20v-20h-40v-60h-30v60h-80v-60h-30v60h-40v20h-20v20h-20v70h-30v30h30v40h60v50h50v-50h80v50h50v-50h60v-40h30v-30h-30zm-190 100h-50v-70h50zm130 0h-50v-70h50z" />
                <path d="m410 100h30v90h-30z" />
              </g>
            </svg>
            <span className="header-title-text">ゲーム年表</span>
          </h1>
          <div className="header-buttons">
            <button
              type="button"
              className={clsx(
                "button is-melt is-circle",
                activeModal === "info" && "is-active"
              )}
              onClick={() => openModal("info")}
            >
              <BiHelpCircle className="header-button-icon" />
            </button>
            <button
              type="button"
              className={clsx(
                "button is-melt is-circle",
                activeHeaderSearch && "is-active"
              )}
              onClick={changeHeaderSearch}
            >
              <BiSearchAlt className="header-button-icon" />
            </button>
            <button
              type="button"
              className={clsx(
                "button is-melt is-circle",
                activeModal === "booth" && "is-active"
              )}
              onClick={() => openModal("booth")}
            >
              <BiImages className="header-button-icon" />
            </button>
            <button
              type="button"
              className={clsx(
                "button is-melt is-circle",
                activeModal === "setting" && "is-active"
              )}
              onClick={() => openModal("setting")}
            >
              <BiCog className="header-button-icon" />
            </button>
          </div>
        </div>

        <div
          className={clsx("header-search", activeHeaderSearch && "is-active")}
        >
          <div className="header-search-inner">
            <div>
              <div className="header-search-field">
                <input
                  type="text"
                  className="input"
                  placeholder="検索..."
                  value={setting.searchText || ""}
                  onChange={(e) => changeSearchText(e.target.value.trim())}
                  ref={headerSearchRef}
                />
                {setting.searchText && (
                  <button
                    type="button"
                    className="button is-melt is-circle is-clear"
                    onClick={() => changeSearchText("")}
                  >
                    <BiX className="header-search-clean-icon" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
