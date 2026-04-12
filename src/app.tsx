import { clsx } from "clsx"
import { useState, useEffect } from "react"

import { Item, Term, Color } from "./types"
import itemsData from "./assets/items.csv?raw"
import termsData from "./assets/terms.csv?raw"
import { ComponentVariable } from "./components/variable"
import { ComponentHeader } from "./components/header"
import { ComponentTimeline } from "./components/timeline"
import { ComponentSetting } from "./components/setting"
import { ComponentModal } from "./components/modal"
import {
  parseCsv,
  csvToItemList,
  csvToTermList,
  getTermIds,
  filterTermList,
  getColorList,
} from "./utils"
import "./app.css"

export default function App() {
  const parsedItems = parseCsv(itemsData)
  const parsedTerms = parseCsv(termsData)
  const items = csvToItemList(parsedItems)
  const termList = csvToTermList(parsedTerms)
  const categoryIds = getTermIds(items, "category")
  const tagIds = getTermIds(items, "tags")
  const labelIds = getTermIds(items, "labels")
  const tagLabelIds = [...new Set([...tagIds, ...labelIds])]
  const categories = filterTermList(categoryIds, termList)
  const tags = filterTermList(tagLabelIds, termList)
  const colors = getColorList(termList)

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const updateCategoryIds = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id)
        ? prev.filter((prevId) => prevId !== id)
        : [...prev, id],
    )
  }
  const updateTagIds = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id)
        ? prev.filter((prevId) => prevId !== id)
        : [...prev, id],
    )
  }
  return (
    <div className="app">
      <ComponentVariable colors={colors} />

      <div className="app-stage">
        <div className="app-contents">
          <ComponentHeader activeModal={activeModal} openModal={setActiveModal}>
            <ComponentSetting
              categories={categories}
              tags={tags}
              selectedCategoryIds={selectedCategoryIds}
              selectedTagIds={selectedTagIds}
              updateCategoryIds={updateCategoryIds}
              updateTagIds={updateTagIds}
            />
          </ComponentHeader>
          <ComponentTimeline
            items={items}
            tags={tags}
            selectedCategoryIds={selectedCategoryIds}
            selectedTagIds={selectedTagIds}
          />
        </div>
      </div>

      <ComponentModal
        isActive={activeModal === "setting"}
        isMobileSidebar
        title="設定"
        closeModal={() => setActiveModal(null)}
      >
        <ComponentSetting
          categories={categories}
          tags={tags}
          selectedCategoryIds={selectedCategoryIds}
          selectedTagIds={selectedTagIds}
          updateCategoryIds={updateCategoryIds}
          updateTagIds={updateTagIds}
        />
      </ComponentModal>
    </div>
  )
}
