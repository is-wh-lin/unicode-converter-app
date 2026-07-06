import { type ChangeEvent, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, Copy, Trash2 } from 'lucide-react';

const toUnicode = (value: string, escapeAllChars: boolean): string => {
  return value
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);

      if (escapeAllChars || code > 127) {
        return `\\u${code.toString(16).padStart(4, '0')}`;
      }

      return char;
    })
    .join('');
};

const fromUnicode = (value: string): string => {
  const standardUnicodeResult = value.replace(/\\u([0-9a-fA-F]{4})/g, (_match, group: string) => {
    return String.fromCharCode(Number.parseInt(group, 16));
  });

  return standardUnicodeResult.replace(/\\u\{([0-9a-fA-F]+)\}/g, (match, group: string) => {
    try {
      return String.fromCodePoint(Number.parseInt(group, 16));
    } catch {
      return match;
    }
  });
};

const copyWithTextareaFallback = (content: string): boolean => {
  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

const writeClipboard = async (content: string): Promise<boolean> => {
  if (!content) return false;

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      return copyWithTextareaFallback(content);
    }
  }

  return copyWithTextareaFallback(content);
};

export default function App() {
  const [text, setText] = useState('');
  const [unicode, setUnicode] = useState('');
  const [escapeAll, setEscapeAll] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUnicode, setCopiedUnicode] = useState(false);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = event.target.value;
    setText(nextText);
    setUnicode(toUnicode(nextText, escapeAll));
  };

  const handleUnicodeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextUnicode = event.target.value;
    setUnicode(nextUnicode);
    setText(fromUnicode(nextUnicode));
  };

  const handleToggleEscape = () => {
    setEscapeAll((previousValue) => {
      const nextValue = !previousValue;
      setUnicode(toUnicode(text, nextValue));
      return nextValue;
    });
  };

  const handleClear = () => {
    setText('');
    setUnicode('');
  };

  const handleCopy = async (content: string, target: 'text' | 'unicode') => {
    const success = await writeClipboard(content);
    if (!success) return;

    if (target === 'text') {
      setCopiedText(true);
      window.setTimeout(() => setCopiedText(false), 2000);
      return;
    }

    setCopiedUnicode(true);
    window.setTimeout(() => setCopiedUnicode(false), 2000);
  };

  return (
    <main className="min-h-screen bg-neutral-50 p-4 font-sans text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ArrowRightLeft className="h-6 w-6 text-blue-500" aria-hidden="true" />
              Unicode 轉換工具
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              支援中文與 Unicode ({'\\uXXXX'}) 即時雙向轉換
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={escapeAll}
                onChange={handleToggleEscape}
                className="rounded border-transparent bg-neutral-200 text-blue-500 focus:ring-blue-500 dark:bg-neutral-700"
              />
              轉換包含英數的所有字元
            </label>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 rounded-lg p-2 text-sm text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
              title="清空內容"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">清空</span>
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">一般文字 (Text)</span>
              <button
                type="button"
                onClick={() => void handleCopy(text, 'text')}
                className="text-neutral-400 transition-colors hover:text-blue-500"
                title="複製文字"
                aria-label="複製一般文字"
              >
                {copiedText ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="請輸入中文或其他文字..."
              className="min-h-[300px] w-full flex-1 resize-none bg-transparent p-4 focus:outline-none"
            />
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Unicode 編碼</span>
              <button
                type="button"
                onClick={() => void handleCopy(unicode, 'unicode')}
                className="text-neutral-400 transition-colors hover:text-blue-500"
                title="複製編碼"
                aria-label="複製 Unicode 編碼"
              >
                {copiedUnicode ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <textarea
              value={unicode}
              onChange={handleUnicodeChange}
              placeholder="例如：\\u4e2d\\u6587..."
              className="min-h-[300px] w-full flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed focus:outline-none"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
