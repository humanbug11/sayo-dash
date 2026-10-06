# Work引き継ぎ：左右でダッシュ！

## 目的
「Speed Starsのような入力の気持ちよさ」を出発点にしつつ、完全コピーではなく、キーボード操作・ジャンプ・スライディング・ブースト・ギミック・コイン・横スクロールで独自のブラウザゲームにする。

## 現在のゲーム仕様
- ゲーム名：左右でダッシュ！
- PCブラウザ向け
- HTML + CSS + TypeScript + Phaser 3 + Vite
- A/D交互入力で加速
- 入力タイミング判定：パーフェクト / グッド / ミス
- W：ジャンプ
- S：スライディング
- Space：ダッシュ
- 横スクロール
- ブースト床
- コイン
- 障害物
- 落下復帰
- ゴール
- タイム計測
- リザルト

## 画像データ
`public/assets/reference/` に今回生成した画像10枚を整理済み。

### character
- `01_future_runner_concept.png`：初期の未来系キャラ案
- `02_stick_runner_concept.png`：採用方向に近い棒人間系キャラ案

### stages
- `01_stage_skyline_concept.png`：初期ステージイメージ
- `02_stage_panorama_set_a.png`：複数ステージ横長案A
- `03_stage_panorama_set_b.png`：複数ステージ横長案B

### gimmicks
- `01_gimmick_item_sheet_a.png`：加速ギミック・アイテム案A
- `02_gimmick_item_sheet_b.png`：加速ギミック・アイテム案B

### ui
- `01_gameplay_ui_concept.png`：ブラウザゲーム画面UI案
- `02_browser_game_plan.png`：ゲーム化プランのボード
- `03_project_folder_guide.png`：開発フォルダ構成イメージ

## 重要
参考画像は一覧シートやコンセプト画像が中心で、そのまま本番ゲームに使う前提ではない。
本番では以下を個別透過PNG化すること。
- キャラクター：run / jump / slide
- boost
- jump_pad
- wind
- spike
- coin
- speed item
- shield
- speed line
- dust
- goal / UI

## 次の優先作業
1. `npm install` → `npm run build` でビルド確認
2. 実ブラウザでA/D交互入力の操作感を確認
3. RunInputの速度カーブとPerfect判定幅を調整
4. 棒人間を本番スプライト化
5. 参考画像から使うギミックを個別素材化
6. 本番ステージ背景をゲームに実装
7. 加速・ジャンプ・スライド時のアニメーションと効果音を追加
8. プレイテストして「連打だけが最適解」にならないよう調整

## GitHub
https://github.com/humanbug11/sayo-dash

GitHub側が更新されている場合は、GitHub版を正として差分を確認してから作業すること。
