window.__ModuleLoader__.load({
  id: 'dsh-line-tight',
  factory(require) {
    const React = require('react');
    const STORAGE_KEY = 'dsh-line-tight';
    const DEFAULTS = { lineHeight: 21, paragraphGap: 8 };
    const LIMITS = { lineHeight: [14, 40], paragraphGap: [0, 32] };

    const clampValue = (field, value) => {
      const [min, max] = LIMITS[field];
      const n = Number(value);
      if (!Number.isFinite(n)) return DEFAULTS[field];
      return Math.min(max, Math.max(min, Math.round(n)));
    };

    const read = () => {
      let saved = {};
      try {
        saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') || {};
      } catch {
        saved = {};
      }
      return {
        lineHeight: clampValue('lineHeight', saved.lineHeight ?? DEFAULTS.lineHeight),
        paragraphGap: clampValue('paragraphGap', saved.paragraphGap ?? DEFAULTS.paragraphGap),
      };
    };

    const persist = (values) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      } catch {
        /* storage unavailable: keep the in-memory value */
      }
    };

    const buildCss = ({ lineHeight, paragraphGap }) => {
      const itemGap = Math.max(1, Math.round(paragraphGap / 3));
      return `
html body {
  --dsw-font-markdown-base: var(--dsh-content-font-size, 14px) / calc(${lineHeight}px + var(--dsh-content-font-delta)) var(--dsw-font-family);
  --dsw-font-markdown-base-line-height: calc(${lineHeight}px + var(--dsh-content-font-delta));
}
[class*="_markdown_"]:not([class*="_compact_"]) {
  line-height: calc(${lineHeight}px + var(--dsh-content-font-delta));
}
[class*="_markdown_"] p { margin: ${paragraphGap}px 0; }
[class*="_markdown_"] :where(ul, ol) { margin: ${paragraphGap}px 0; }
[class*="_markdown_"] li:not(:first-child) { margin-top: ${itemGap}px; }
[class*="_markdown_"] li > p { margin: ${itemGap}px 0; }
[class*="_markdown_"] :where(h1, h2, h3) { margin: ${paragraphGap * 2}px 0 ${paragraphGap}px; }
[class*="_markdown_"] > :first-child { margin-top: 0; }
[class*="_markdown_"] > :last-child { margin-bottom: 0; }
`;
    };

    const labelStyle = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 };
    const inputStyle = {
      width: 56,
      padding: '3px 6px',
      borderRadius: 6,
      border: '1px solid rgba(127,127,127,.45)',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      textAlign: 'center',
    };
    const hintStyle = { fontSize: 12, opacity: 0.62, lineHeight: 1.5 };
    const titleStyle = { fontSize: 14, fontWeight: 600 };

    const LineRow = ({ useStore }) => {
      const [values, setValues] = React.useState(read);
      const [draft, setDraft] = React.useState({
        lineHeight: String(read().lineHeight),
        paragraphGap: String(read().paragraphGap),
      });
      const apply = (next) => {
        setValues(next);
        persist(next);
        const style = document.getElementById('dsh-line-tight');
        if (style) style.textContent = buildCss(next);
      };
      const commit = (field) => {
        const next = clampValue(field, draft[field]);
        setDraft((prev) => ({ ...prev, [field]: String(next) }));
        if (next !== values[field]) apply({ ...values, [field]: next });
      };
      const field = (key, label, unit) =>
        React.createElement(
          'label',
          { style: labelStyle },
          `${label}`,
          React.createElement('input', {
            type: 'number',
            value: draft[key],
            min: LIMITS[key][0],
            max: LIMITS[key][1],
            style: inputStyle,
            onChange: (event) => setDraft((prev) => ({ ...prev, [key]: event.target.value })),
            onBlur: () => commit(key),
            onKeyDown: (event) => {
              if (event.key === 'Enter') commit(key);
            },
          }),
          React.createElement('span', { style: { opacity: 0.6 } }, unit),
        );

      return React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        React.createElement('div', { style: titleStyle }, '行距'),
        React.createElement(
          'div',
          { style: { display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' } },
          field('lineHeight', '正文行高', 'px'),
          field('paragraphGap', '段间距', 'px'),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: () => {
                setDraft({ lineHeight: String(DEFAULTS.lineHeight), paragraphGap: String(DEFAULTS.paragraphGap) });
                apply({ ...DEFAULTS });
              },
              style: {
                ...labelStyle,
                padding: '3px 10px',
                borderRadius: 6,
                border: '1px solid rgba(127,127,127,.45)',
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
              },
            },
            '恢复默认',
          ),
        ),
        React.createElement(
          'div',
          { style: hintStyle },
          `行高 = ${values.lineHeight}px + (正文字号 - 14px)，段间距 ${values.paragraphGap}px。改完按回车或点空白处立即生效，存在本机浏览器。`,
        ),
      );
    };

    return {
      inject: ['slots'],
      apply(ctx) {
        const style = document.createElement('style');
        style.id = 'dsh-line-tight';
        style.textContent = buildCss(read());
        document.head.appendChild(style);
        ctx.effect(() => () => style.remove(), 'dsh-line-tight: stylesheet');

        ctx.slots.inject('settings.general.item', () =>
          ctx.slots.register(
            {
              name: 'settings.general.item',
              id: 'line-tight',
              order: 12,
            },
            LineRow,
          ),
        );
      },
    };
  },
});
