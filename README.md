# 星綴ルミナ / Lumina Official Website

オリジナル架空キャラクター「星綴ルミナ」のコンセプト公式サイトです。

**Live:** https://lovingthenhk-cpu.github.io/lumina-hoshitsuzuri-official/

## Features
- レスポンシブな一枚構成の公式サイト（NEWS / STORY / PROFILE / GALLERY）
- 独自SVGキャラクターアートとCSSによる星空・月・封筒のグラフィック
- ビジュアルギャラリーのダイアログ表示
- 端末内のみで動作する「星のポスト」と星集め機能（通信・保存なし）
- キーボード操作 / reduced-motion / Skip link に対応
- JavaScriptのビルド工程、依存パッケージ、解析ツールなし

## Local preview
\`\`\`bash
python3 -m http.server 8000
\`\`\`

http://localhost:8000 を開いてください。

## Deploy
このリポジトリの \`main\` ブランチの \`/\` をGitHub Pagesのソースに設定します。

© 2026 Hoshitsuzuri Lumina. This is a fictional character concept, not a real entertainer.

## Generated art assets
- `assets/lumina-generated.png`: transparent PNG of Lumina, extracted from an AI-generated composition.
- `assets/star-companion.png`, `assets/star-lantern.png`: transparent prop sprites.
- Backgrounds, section decorations, cards, typography and layout are all HTML/CSS (not screenshot images).

## Expansion — 星の郵便局 2.0

- **World atlas**: six clickable star-map destinations and a discovery counter.
- **Daily star letter**: deterministic entertainment message based on calendar date in Japan.
- **Star personality**: four-question fictional attribute quiz with retake support.
- **Starry diary**: four original character stories with accessible keyboard tabs.
- **Postcard studio**: three palettes, live HTML Canvas preview, PNG download; user text is not uploaded.
- **Star passport**: six unlockable stamps; only anonymous progress is kept in browser localStorage.
- **FAQ**, quick-jump navigation, stamp notifications, Aurora/Night theme switch and share action.
- **PWA**: web app manifest and versioned offline service worker. Fonts may fall back when offline.
- **Accessibility**: labelled controls, native form fields, tab semantics, status announcements and reduced-motion CSS.

### Data handling
Postcard and letter text is processed locally in browser memory; it is **not** saved to localStorage or sent to the site server. Progress and selected sky palette are stored locally where permitted. There is no registration, backend, analytics, or external API for the interactive features. Fonts are requested from Google Fonts when online.
\n- **Meteor Catch**: 30-second pointer/touch/keyboard canvas mini-game, local high-score tracking, no online server.\n