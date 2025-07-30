import "./index.css"

const readmeCsvUrl = "https://github.com/qrac/game-timeline/blob/main/README.md"
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

export function ComponentInfo() {
  return (
    <div className="info-container">
      <div className="info-docs">
        <div>
          <img src="/assets/v2.png" alt="v2" width={760} height={486} />
        </div>
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
      <div className="info-links">
        <ul>
          {linkList.map((item, index) => (
            <li key={index}>
              {item.title}: <a href={item.url}>{item.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
