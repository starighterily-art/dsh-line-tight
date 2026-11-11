# dsh-line-tight

Tighter line height and paragraph spacing for the DeepSeek Harness chat transcript, with two knobs in Settings.

The host draws assistant and user text at a 24px line box and 16px between paragraphs. On a 15px font that reads airy, and there is no setting for it. This plugin sets the markdown line height to 21px and the paragraph gap to 8px, then offers the two numbers in **Settings → General → 行距**.

## What it does

- Rewrites the transcript markdown rhythm: line height, paragraph margins, list spacing, and heading margins.
- Adds a **行距** row under **Settings → General** with two number fields:
  - **正文行高** — line height in px, 14 to 40, default 21
  - **段间距** — paragraph gap in px, 0 to 32, default 8
  - **恢复默认** resets both to 21 / 8
- Applies immediately on Enter or blur. No restart.
- Stores the values in `localStorage` under the key `dsh-line-tight`, so they survive reloads and are per browser.

Line height is computed as `21px + (正文字号 - 14px)`, so raising the host font size keeps the same ratio instead of clipping. List item gaps are one third of the paragraph gap, minimum 1px. Heading margins scale with the paragraph gap.

Only markdown blocks are touched. Compact rows (tool headers, one-line summaries) keep the host spacing.

## Install

```sh
dsh plugin --profile <profile> add github:starighterily-art/dsh-line-tight
```

Or from a checkout:

```sh
dsh plugin --profile <profile> add ./dsh-line-tight
```

Restart the host once after installing. The client half is a browser bundle, so it does not hot-reload.

## Files

| File | Role |
| --- | --- |
| `index.js` | Host half. Empty on purpose. |
| `client.js` | Browser half: injects the stylesheet and registers the settings row. |
| `cordis.patch.yml` | Bundle patch that inserts the plugin into the profile. |

## Caveats

The stylesheet targets markdown containers by the host's CSS module class name: `[class*="_markdown_"]`. If a future host release renames that class, spacing silently falls back to the host defaults — nothing breaks, the knobs just stop biting. The two CSS variables it sets (`--dsw-font-markdown-base-line-height`, `--dsw-font-markdown-base`) are the same ones the host already defines.

Works on DSH 0.2.x web. No host-side network access, no telemetry.

## 说明（中文）

把对话正文的行距和段间距压紧：行高默认 21px（宿主 24px），段间距默认 8px（宿主 16px）。设置在 **设置 → 通用 → 行距**，两个数字框加一个「恢复默认」；改完按回车或点空白处立即生效，值存在浏览器 `localStorage` 里，键名 `dsh-line-tight`。

可调范围：正文行高 14–40px，段间距 0–32px。列表项间距取段间距的三分之一，标题上下留白按段间距缩放。只动 markdown 正文块，工具调用那类紧凑行保持宿主原样。

## License

MIT
