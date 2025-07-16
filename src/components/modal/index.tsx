import { useEffect, useRef } from "react"
import { clsx } from "clsx"
import { FiX, FiDownload, FiUpload } from "react-icons/fi"

import type { Setting } from "../../types"
import { ComponentSelect } from "../select"
import { ComponentCheck } from "../check"
import { ComponentTagcloud } from "../tagcloud"
import { getYearList } from "../../utils"
import "./index.css"

const sidebarIds = ["setting"]

export function ComponentModal({
  activeModal,
  closeModal,
  //imageData,
  setting,
  changeSetting,
  changeCurrentLank,
  uploadItems,
  uploadTerms,
}: {
  activeModal: string | null
  closeModal: () => void
  //imageData: string | null
  setting: Setting
  changeSetting: (newSetting: Partial<Setting>) => void
  changeCurrentLank: (currentLank: number) => void
  uploadItems: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadTerms: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        closeModal()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [closeModal])
  return (
    <aside className={clsx("modal", activeModal && "is-active")}>
      <div className="modal-background" onClick={closeModal} />
      {/*<ModalGenerate
        activeModal={activeModal}
        closeModal={closeModal}
        imageData={imageData}
      />*/}
      <ModalInfo activeModal={activeModal} closeModal={closeModal} />
      <ModalSetting
        activeModal={activeModal}
        closeModal={closeModal}
        setting={setting}
        changeSetting={changeSetting}
        changeCurrentLank={changeCurrentLank}
        uploadItems={uploadItems}
        uploadTerms={uploadTerms}
      />
    </aside>
  )
}

function ModalContainer({
  modalId,
  activeModal,
  children,
}: {
  modalId: string
  activeModal: string | null
  children: React.ReactNode
}) {
  return (
    <div
      className={clsx(
        "modal-container",
        sidebarIds.includes(modalId) && "is-mobile-sidebar",
        activeModal === modalId && "is-active"
      )}
    >
      {children}
    </div>
  )
}

function ModalHeader({
  title,
  closeModal,
}: {
  title: string
  closeModal: () => void
}) {
  return (
    <div className="modal-header">
      <h2 className="modal-header-title">{title}</h2>
      <div className="modal-header-right">
        <button
          type="button"
          className="button is-melt is-square"
          onClick={closeModal}
        >
          <FiX />
        </button>
      </div>
    </div>
  )
}

/*function ModalGenerate({
  activeModal,
  closeModal,
  imageData,
}: {
  activeModal: string | null
  closeModal: () => void
  imageData: string | null
}) {
  return (
    <ModalContainer modalId="generate" activeModal={activeModal}>
      <ModalHeader title="画像化" closeModal={closeModal} />
      <div className="modal-contents">
        <div className="modal-generate-viewer">
          {imageData ? (
            <img
              className="modal-generate-viewer-image"
              src={imageData}
              alt="Generated"
            />
          ) : (
            <div className="modal-generate-viewer-placeholder">
              <p>画像を生成中...</p>
            </div>
          )}
        </div>
        <div className="modal-generate-buttons">
          <a
            href={imageData}
            className={clsx(
              "button is-plain is-primary",
              !imageData && "is-disabled"
            )}
            download="game-timeline.png"
          >
            <FiDownload />
            <span className="text">画像を保存</span>
          </a>
        </div>
      </div>
    </Container>
  )
}*/

function ModalInfo({
  activeModal,
  closeModal,
}: {
  activeModal: string | null
  closeModal: () => void
}) {
  const readmeCsvUrl =
    "https://github.com/qrac/game-timeline/blob/main/README.md"
  const linkList = [
    {
      title: "開発者",
      name: "クラク",
      url: "https://x.com/Qrac_JP",
    },
    {
      title: "更新情報",
      name: "GitHub Releases",
      url: "https://github.com/qrac/game-timeline/releases",
    },
    {
      title: "ソースコード",
      name: "GitHub Repository",
      url: "https://github.com/qrac/game-timeline",
    },
  ]
  return (
    <ModalContainer modalId="info" activeModal={activeModal}>
      <ModalHeader title="概要" closeModal={closeModal} />
      <div className="modal-contents">
        <div className="modal-docs">
          <p>
            あの頃、どんなゲームが流行った？どっちが先に出た？続編は何年ぶり？
          </p>
          <p>
            そんなときの振り返り用として、ゲーム機・ゲームソフトのリリース日と時事ネタを年表形式でまとめました。
          </p>
          <p>
            設定で年数を絞り込んだり、カテゴリーやタグでフィルタリングできます。
          </p>
          <p>
            ただ、すべての情報は網羅していませんし、人によって振り返りたい作品は異なるかと思います。
          </p>
          <p>
            そこで、独自のデータを表示させる機能も作りました！設定の最下部からCSVファイルの差し替えが可能です。
          </p>
          <p>
            CSVの書き方は、GitHubの
            <a href={readmeCsvUrl}>README</a>
            をご覧ください。
          </p>
          <p>
            ※外部通信は一切ありません。ブラウザリロードでデフォルトに戻ります。
          </p>
        </div>
        <div className="modal-links">
          <ul>
            {linkList.map((item, index) => (
              <li key={index}>
                {item.title}: <a href={item.url}>{item.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ModalContainer>
  )
}

function ModalSetting({
  activeModal,
  closeModal,
  setting,
  changeSetting,
  changeCurrentLank,
  uploadItems,
  uploadTerms,
}: {
  activeModal: string | null
  closeModal: () => void
  setting: Setting
  changeSetting: (newSetting: Partial<Setting>) => void
  changeCurrentLank: (currentLank: number) => void
  uploadItems: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadTerms: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const {
    itemList,
    lankList,
    categoryList,
    tagList,
    startYear,
    endYear,
    omitEmptyYears,
    currentLank,
    lankNote,
  } = setting
  const yearList = getYearList(itemList)

  const uploadItemsRef = useRef<HTMLInputElement>(null)
  const uploadTermsRef = useRef<HTMLInputElement>(null)

  const handleUploadItems = () => {
    uploadItemsRef.current?.click()
  }
  const handleUploadTerms = () => {
    uploadTermsRef.current?.click()
  }
  return (
    <ModalContainer modalId="setting" activeModal={activeModal}>
      <ModalHeader title="設定" closeModal={closeModal} />
      <div className="modal-contents">
        <div className="modal-fields">
          <div className="modal-field">
            <h3 className="modal-field-title">表示する年</h3>
            <div className="modal-field-selects">
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
            <ComponentCheck
              checked={omitEmptyYears}
              onChange={(e) => {
                changeSetting({ omitEmptyYears: e.target.checked })
              }}
              text="データのない年を省略"
            />
          </div>
          <div className="modal-field">
            <h3 className="modal-field-title">表示する情報量</h3>
            <ComponentSelect
              value={currentLank}
              onChange={(e) => {
                changeCurrentLank(Number(e.target.value))
              }}
              list={lankList}
            />
            {lankNote && <p className="modal-field-note">※{lankNote}</p>}
          </div>

          {categoryList.length > 0 && (
            <div className="modal-field">
              <h3 className="modal-field-title">カテゴリーフィルター</h3>
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
            <div className="modal-field">
              <h3 className="modal-field-title">タグフィルター</h3>
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

          <div className="modal-field">
            <h3 className="modal-field-title">データの差し替え</h3>
            <div className="modal-field-buttons">
              <a
                href="/assets/items.csv"
                className="button is-outline is-square"
                download
              >
                <FiDownload />
              </a>
              <button
                type="button"
                className="button is-plain is-primary"
                onClick={handleUploadItems}
              >
                <FiUpload />
                <span className="text">ブラウザで開く</span>
              </button>
              <input
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                ref={uploadItemsRef}
                onChange={uploadItems}
              />
            </div>
          </div>

          <div className="modal-field">
            <h3 className="modal-field-title">カテゴリー・タグの差し替え</h3>
            <div className="modal-field-buttons">
              <a
                href="/assets/terms.csv"
                className="button is-outline is-square"
                download
              >
                <FiDownload />
              </a>
              <button
                type="button"
                className="button is-plain is-primary"
                onClick={handleUploadTerms}
              >
                <FiUpload />
                <span className="text">ブラウザで開く</span>
              </button>
              <input
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                ref={uploadTermsRef}
                onChange={uploadTerms}
              />
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  )
}
