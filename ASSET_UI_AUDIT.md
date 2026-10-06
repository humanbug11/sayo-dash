# ZIP素材と製品版UIの採用状況

基準: `sayo-dash-work-package (1).zip` の `WORK_HANDOFF.md` と GitHub main (899b88d)。
ZIP原本は参照専用。10枚のPNGは完成スプライトではなくコンセプト／一覧画像です。
実際に使用できる透過キャラクター、HUD部品、音声はZIPにはありません。
ZIP由来の参考画像を `public/assets/reference/` に内容を変えず保存しています。

## ZIP全10画像

| ファイル（public/assets/reference/ 以下） | 分類 | 採用・用途 |
| --- | --- | --- |
| character/02_stick_runner_concept.png | 本番デザイン採用・個別素材化 | RAYNの髪、白パーカー、黒パンツ、シアン／黄色の配色を6ポーズの透過アトラスに反映 |
| character/01_future_runner_concept.png | 未使用候補 | 別キャラクター案。RAYNとの混在を避け保管 |
| stages/01_stage_skyline_concept.png | 本番デザイン採用・要実装変換 | 明るい街、屋上、シアンの床端、ジャンプ穴、スライド通路をPhaser描画で実装 |
| stages/02_stage_panorama_set_a.png | 未使用候補 | 複数ステージ案。今回は街1コースのUI改修 |
| stages/03_stage_panorama_set_b.png | 未使用候補 | 複数ステージ案。追加ステージ用として保管 |
| gimmicks/01_gimmick_item_sheet_a.png | 使えるが要調整 | ギミックの形／配色の参考。ブースト、障害物はコード描画 |
| gimmicks/02_gimmick_item_sheet_b.png | 重複デザイン候補・要調整 | 別案を保管。未実装アイテムを今回追加しない |
| ui/01_gameplay_ui_concept.png | 使えるが要調整 | ロゴ／配色の方向性。大きな帯は今回の指示に従い採用しない |
| ui/02_browser_game_plan.png | 設計参考 | ボード全体をゲーム内に貼り付けない |
| ui/03_project_folder_guide.png | 設計参考 | フォルダ配置の資料 |

## ランタイム素材と置換

| カテゴリ | 採用ファイル／実装 | 状態 |
| --- | --- | --- |
| キャラクター | character/rayn-atlas.png | ZIPのRAYNコンセプトから組み込みImageGenで個別素材化。Run A / Run D / Jump / Slide / Dash / Goal の3列×2行。透明部分を検出して比率と足元を揃えて読み込む |
| 被弾 | Jumpポーズ＋赤い点滅色、ノックバック、HIT表示 | 同一キャラで表現。専用Hit画像は不足、今回の表現は代替であることを明記 |
| ロゴ | ui/logo.webp | 既存mainの素材を継続採用（ZIP内に単体ロゴはない） |
| コイン | ui/coin.webp | 既存mainの素材、浮遊・取得粒子・+1を適用 |
| ゴール | ui/goal_sign.webp | 既存mainの素材、キャラGoalポーズ・粒子・瞬間表示を追加 |
| 背景・ステージ装飾 | GameScene.createBackground / addPlatform | ZIPの街案を基準に2Dパララックス街並みと屋上を描画。文字入り一覧シートを背景として使わない |
| 床・ブースト・トゲ・通路 | GameScene.createStage | 床端の色分け、穴の下に偽の床を描かない。トゲはW、通路はSで回避 |
| HUD | GameScene.createHud | 軽い半透明カード、TIME / SPEED / COMBO / GOAL進行度 / COIN。黒帯素材は未使用 |
| ボタン・リザルト | utils/ui.ts / MenuScene / ResultScene | コード描画による本番UI。比率を壊す画像ボタンの拡大アニメーションを廃止 |
| 操作ガイド | GameScene.guide | 開始後3秒、Hで3秒再表示、最後の0.3秒でフェード |
| エフェクト | speedLines / burst / ghost | スピードライン、ブースト、着地、足元の砂煙、残像、コイン、ゴールを2Dで表現 |
| Three.js | ThreeBackdrop | タイトル背面のみ。レース・結果画面では非表示かつ描画を停止 |
| 音声 | 不足 | ZIPにSE/BGMはない。今回のUI・視覚演出改修の対象外 |

既存の `ui/hud.webp`, `ui/control_strip.webp`, `ui/button_start.webp` は未使用。
素材を無断削除せず残しているが、ランタイムの読み込み対象から外した。
生成手順／プロンプトは `ASSET_GENERATION.md` を参照。

## 記録と入力

- PERFECT連続入力のみコンボ加算。GOOD / LATE / MISSで切れる。
- 最大コンボ・PERFECT率・コイン15枚・入力ミス／被弾／落下回数をリザルトへ渡す。
- 街の最速タイムをlocalStorageに保存。ストレージが使えなくてもプレイ継続。
- 既存の22秒／30秒／42秒のランク境界をGOLD / SILVER / BRONZE表示に使用。
- 走行タイミングの境界と基本操作、既存のコース長、主要な足場配置は維持。
