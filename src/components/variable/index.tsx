import type { Setting } from "../../types"

export function ComponentVariable({ setting }: { setting: Setting }) {
  const { colorList, scrollbarWidth, appSlide, headerHeight } = setting
  const colorCss = colorList
    .map((color) => {
      return `.is-accent-${color.id} { --pj-color-accent: ${color.color}; }`
    })
    .join("\n")
  const scrollbarCss = `:root { --pj-scrollbar-width: ${scrollbarWidth}px; }`
  const appSlideCss = `:root { --pj-app-slide: ${appSlide}px; }`
  const headerCss = `:root { --pj-fixed-header-height: ${headerHeight}px; }`
  return (
    <>
      {colorList.length > 0 && <style>{colorCss}</style>}
      {scrollbarWidth > 0 && <style>{scrollbarCss}</style>}
      <style>{appSlideCss}</style>
      <style>{headerCss}</style>
    </>
  )
}
