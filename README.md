# Unicode 轉換工具

一個以 React + TypeScript + Vite 製作的 Unicode 轉換工具，支援一般文字與 Unicode 編碼即時雙向轉換。

## 功能

- 一般文字轉 Unicode 編碼
- Unicode 編碼轉一般文字
- 支援 `\\uXXXX` 與 `\\u{XXXXX}` 格式
- 可選擇是否轉換 ASCII 字元
- 一鍵複製文字或編碼
- 支援系統深色模式

## 本機開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

## GitHub Pages 部署

此專案已內建 GitHub Actions workflow。推送到 `main` branch（分支）後，會自動建置並部署到 GitHub Pages。

部署前請到 GitHub repository（儲存庫）：

`Settings` → `Pages` → `Build and deployment` → `Source` 選擇 `GitHub Actions`
