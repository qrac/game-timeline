import { useEffect } from "react"
import { clsx } from "clsx"
import { BiX, BiChevronRight } from "react-icons/bi"

import "./index.css"

export function ComponentModal({
  isActive,
  isMobileSidebar,
  title,
  closeModal,
  children,
}: {
  isActive: boolean
  isMobileSidebar?: boolean
  title: string
  closeModal: () => void
  children?: React.ReactNode
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        e.preventDefault()
        closeModal()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [closeModal])
  return (
    <aside className={clsx("modal", isActive && "is-active")}>
      <div className="modal-background" onClick={closeModal} />
      <div
        className={clsx(
          "modal-container",
          isMobileSidebar && "is-mobile-sidebar",
          isActive && "is-active"
        )}
      >
        <div className="modal-header">
          <h2 className="modal-header-title">{title}</h2>
          <div className="modal-header-right">
            <button
              type="button"
              className="button is-melt is-square"
              onClick={closeModal}
            >
              <BiX className="modal-header-button-icon is-close" />
              <BiChevronRight className="modal-header-button-icon is-back" />
            </button>
          </div>
        </div>
        <div className="modal-contents">{children}</div>
      </div>
    </aside>
  )
}
