# キャラクター素材の生成記録

組み込みImageGenを使用。CLI/APIキーによる生成は使用していません。
保存先: `public/assets/character/rayn-atlas.png`
参考: ZIPの `public/assets/reference/character/02_stick_runner_concept.png`

## 初回プロンプト

Create a production game sprite atlas from this REFERENCE IMAGE, preserving RAYN's exact chibi identity: black spiky hair with cyan clip, white hoodie, black shorts yellow stripe, black leggings, white cyan yellow sneakers. Transparent background. Exactly SIX poses in a perfectly regular 3 columns by 2 rows grid, square canvas 1536x1536, each cell 512x768. All face RIGHT. Top row: running left foot forward, running right foot forward, airborne jump. Bottom row: low sliding pose, forward leaning dash, happy goal raised arms. Entire character inside each cell with generous transparent margins, consistent character scale and foot baseline, no shadows, no text, no labels, no borders, no UI, no extra characters. Crisp polished illustrated sprite art.

## 修正プロンプト

Edit this exact transparent 3x2 game sprite sheet. Preserve all six characters and exact regular 3 columns 2 rows grid, transparent background, original canvas size. Change ONLY TOP MIDDLE character: he must run with opposite leg and arm phase compared to TOP LEFT. Top middle's forward/rightward foot is now bent back underneath hip and the other foot extends forward/rightward, arms swap opposite too; same right-facing head, hair, outfit, proportions and baseline. Every other cell must be unchanged. Keep all characters fully inside their cells. No text.

## 実際の出力

生成されたPNGは1254×1254。要求したサイズと異なるため、ローダーは画像の実寸を3列×2行に分割し、各セルの透明領域を検出して256×256のゲーム用テクスチャへ正規化します。スライドは低い姿勢を維持。全ポーズの足元を揃えて当たり判定の位置を固定します。
6ポーズは目視確認済み。被弾は専用画像が無いためジャンプポーズに赤色とノックバックを適用しています。
