import type { Term } from "../../types"
import { ComponentTagcloud } from "../tagcloud"
import "./index.css"

export function ComponentSetting({
  categories,
  tags,
  selectedCategoryIds,
  selectedTagIds,
  updateCategoryIds,
  updateTagIds,
}: {
  categories: Term[]
  tags: Term[]
  selectedCategoryIds: string[]
  selectedTagIds: string[]
  updateCategoryIds: (id: string) => void
  updateTagIds: (id: string) => void
}) {
  const filterdTags = tags.filter((term) => term.filter)
  return (
    <div className="setting is-space-sm">
      {categories.length > 0 && (
        <div className="box is-space-xs">
          <h3 className="text is-weight-600 is-xs">カテゴリーフィルター</h3>
          <div className="box is-sm">
            <ComponentTagcloud
              list={categories}
              selectedIds={selectedCategoryIds}
              onToggle={(id) => updateCategoryIds(id)}
            />
          </div>
        </div>
      )}

      {filterdTags.length > 0 && (
        <div className="box is-space-xs">
          <h3 className="text is-weight-600 is-xs">タグフィルター</h3>
          <div className="box is-sm">
            <ComponentTagcloud
              list={filterdTags}
              selectedIds={selectedTagIds}
              onToggle={(id) => updateTagIds(id)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
