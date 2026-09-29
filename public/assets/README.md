# 本番アセット配置

このフォルダに本番用の画像・音声を配置します。

## フォルダ

- `character/` : プレイヤー画像・スプライトシート
- `stages/` : 横長ステージ背景・ステージ用背景
- `gimmicks/` : ブースト床、ジャンプ台、風、トゲなど
- `items/` : コイン、スピード、シールド、ウイングなど
- `effects/` : ダッシュ、砂煙、スピード線など
- `ui/` : タイトル、ボタン、ゴール、HUD素材
- `audio/` : BGM・効果音

## 推奨ファイル名

### character
- runner.png
- runner_run.png
- runner_jump.png
- runner_slide.png

### stages
- stage01_bg_01.png
- stage01_bg_02.png
- stage01_bg_03.png

### gimmicks
- boost.png
- jump_pad.png
- wind.png
- spike.png
- moving_platform.png

### items
- coin.png
- speed.png
- shield.png
- wing.png

### effects
- speed_line.png
- dust.png
- boost_effect.png

### ui
- title.png
- button_start.png
- goal.png

Phaser からは `assets/...` で参照します。
例:

```ts
this.load.image('boost', 'assets/gimmicks/boost.png');
```
