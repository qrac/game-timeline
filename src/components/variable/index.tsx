import type { Options } from "../../types"

export function ComponentVariable({
  options,
  scrollbarWidth,
}: {
  options: Options
  scrollbarWidth: number
}) {
  const { colorList } = options
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
