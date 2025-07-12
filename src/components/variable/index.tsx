import type { Color } from "../../types"

export function ComponentVariable({
  colorList,
  scrollbarWidth,
}: {
  colorList: Color[]
  scrollbarWidth: number
}) {
  const colorCss = colorList
    .map((color) => {
      return `.is-accent-${color.id} { --pj-color-accent: ${color.color}; }`
    })
    .join("\n")
  const scrollbarCss = `:root { --pj-scrollbar-width: ${scrollbarWidth}px; }`
  return (
    <>
      {colorList.length > 0 && <style>{colorCss}</style>}
      {scrollbarWidth > 0 && <style>{scrollbarCss}</style>}
    </>
  )
}
