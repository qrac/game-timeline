export function ComponentSelect({
  value,
  onChange,
  list,
}: {
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  list: (string | number)[]
}) {
  return (
    <div className="select">
      <select value={value} onChange={onChange}>
        {list.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  )
}
