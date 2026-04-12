import { clsx } from "clsx"
import { FiSettings } from "react-icons/fi"

import "./index.css"

export function ComponentHeader({
  activeModal,
  openModal,
  children,
}: {
  activeModal: string | null
  openModal: (modal: string) => void
  children?: React.ReactNode
}) {
  return (
    <header className="header">
      <div className="box desktop:is-none">
        <div className="box is-flex is-middle is-pt-sm is-px-md is-nb-xxs">
          <div className="box is-flex-0">
            <Title />
          </div>
          <div className="box">
            <div className="box is-flex is-middle is-gap-xs">
              <button
                type="button"
                className={clsx(
                  "button is-melt is-circle is-xs is-wide-none",
                  activeModal === "setting" && "is-active",
                )}
                onClick={() => openModal("setting")}
              >
                <FiSettings className="header-button-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="box is-py-md is-space-md is-none desktop:is-block">
        <div className="box">
          <Title />
        </div>
        <div className="header-sticky">{children}</div>
      </div>
    </header>
  )
}

function Title() {
  return (
    <a href="/">
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
    </a>
  )
}
