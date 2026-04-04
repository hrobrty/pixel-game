# PIXEL QUIZ — 像素風闖關問答遊戲 🕹️

這是一款使用 React + Vite 構建的復古像素風闖關問答遊戲。前端採用原生 CSS 打造街機效果（CRT 掃描線、閃爍動畫、獨立的 DiceBear 點陣圖關主），而後端資料庫與計分系統則完全架設於 Google Sheets 與 Google Apps Script (GAS) 之中，輕量且防作弊。

---

## 🛠️ 本地開發與啟動教學

1. **安裝環境依賴**
   在專案根目錄（`pixel-game`）下，確保你已經安裝了 Node.js (建議 v18 以上)。執行以下指令安裝依賴：
   ```bash
   npm install
   ```
   *(註：若身處需代理的網路環境，請確保終端機已設定 proxy 或暫時切換 npm 鏡像)*

2. **環境變數配置**
   在根目錄會看到一個名為 `.env.example` 的檔案。複製一份並將其命名為 `.env`：
   ```bash
   cp .env.example .env
   ```
   接著打開 `.env` 檔案，填入你的 **Google Apps Script 網址**（詳見下方的 GAS 部署教學）。
   ```env
   VITE_GAS_URL=https://script.google.com/macros/s/.../exec
   VITE_PASS_THRESHOLD=70
   VITE_QUESTION_COUNT=10
   ```

3. **啟動伺服器**
   ```bash
   npm run dev
   ```
   成功啟動後，瀏覽器打開終端機提示的本機網址 (通常是 `http://localhost:3001` 或 `3000`) 即可遊玩！

---

## 📊 Google Sheets 雲端資料庫配置設定

遊戲所有的題目來源與得分紀錄都在你的 Google Sheets 裡。請嚴格按照以下步驟建立：

### 步驟 1：建立表單與工作表
1. 新建一個 Google 試算表（Google Sheets）。
2. 在左下方將預設的工作表重新命名為：`題目`。
3. 點擊「+」新增另一個工作表，命名為：`回答`。

### 步驟 2：設定「題目」工作表欄位
在「題目」工作表的第一列（A列~G列），依序填入以下標題：
- A1: `題號` （數字，例如 1, 2, 3...）
- B1: `題目`
- C1: `A` （選項 A 的內容）
- D1: `B` （選項 B 的內容）
- E1: `C` （選項 C 的內容）
- F1: `D` （選項 D 的內容）
- G1: `解答` （正解選項的英文字母，必須是 A 或 B 或 C 或 D）

### 步驟 3：設定「回答」工作表欄位
在「回答」工作表的第一列（A列~G列），依序填入以下標題：
- A1: `ID` （玩家輸入的 ID）
- B1: `闖關次數`
- C1: `總分`
- D1: `最高分`
- E1: `第一次通關分數`
- F1: `花了幾次通關`
- G1: `最近遊玩時間`

---

## ⚙️ Google Apps Script (GAS) 部署教學

前端需要透過 API 來抽取題目與寫入成績，為此我們需要將專案內的腳本部署到雲端。

1. **開啟指令碼編輯器**
   在剛才建立好的 Google Sheets 頂部選單，點選 **「擴充功能」 -> 「Apps Script」**。
2. **貼上代碼**
   打開本專案中的 `/gas/Code.gs` 檔案，複製裡面的**所有內容**。回到瀏覽器的 Apps Script 編輯器，清空預設的程式碼後，貼上剛才複製的內容，並按下 Ctrl+S（或 Cmd+S）保存。
3. **發佈為網頁應用程式**
   - 點擊右上角的 **「部署」 -> 「新增部署作業」**。
   - 點擊左側「選取類型」旁邊的齒輪圖示 ⚙️，勾選 **「網頁應用程式」**。
   - **執行身分**：請選擇 **「我」**（你自己的 Google 帳號）。
   - **存取權**：請務必選擇 **「所有人」**（這點非常關鍵，否則前端無法無載入）。
   - 點選「部署」。
   - *(若是第一次部署，系統會要求「授權存取」，請同意並允許它讀取對應的試算表)*
4. **獲取網址**
   部署完成後，會跳出一個視窗提供「網頁應用程式網址」（開頭為 `https://script.google.com/macros/s/.../exec`）。
   請將這段網址**複製並貼進前端的 `.env` 檔案中的 `VITE_GAS_URL` 裡**，遊戲至此全數配置完畢！

---

## 🚀 自動部署至 GitHub Pages 教學

本專案已設定好 GitHub Actions (`.github/workflows/deploy.yml`)，當你將程式碼 push 到 GitHub 後，即可透過 CI/CD 流程自動部署到 GitHub Pages。請依循以下步驟來開通部署，並正確注入環境變數：

### 1. 開啟 GitHub Actions 的讀寫權限
1. 進入你的 GitHub 專案庫。
2. 點擊頂部的 **「Settings」 -> 左側選單的「Actions」 -> 「General」**。
3. 往下捲動找到 **「Workflow permissions」**，將它改為 **「Read and write permissions」** 並按下 Save。

### 2. 設定 GitHub Secrets 與 Variables
為了讓 GitHub 在雲端打包你的網頁時能夠讀取到正確的參數，我們需要將它們設為 Repository Secrets/Variables：
1. 在同一 Settings 頁面，點選左側的 **「Secrets and variables」 -> 「Actions」**。
2. **新增 Secrets：**
   - 點擊「New repository secret」。
   - **Name**: `VITE_GAS_URL`
   - **Secret**: 貼上你剛才部署的 Google Apps Script 網址。
   - 點擊 Add secret。
3. **新增 Variables (可選，有預設值)：**
   - 切換到旁邊的 **「Variables」** 頁籤，點擊「New repository variable」。
   - **Name**: `VITE_PASS_THRESHOLD`，**Value**: 填入你想設的門檻 (如 `70`)。
   - **Name**: `VITE_QUESTION_COUNT`，**Value**: 填入你想設的題數 (如 `10`)。
   - *(若沒設定，腳本內的預設值會吃 70 與 10)*

### 3. 開通 GitHub Pages 設定
1. 回到專案的 **「Settings」 -> 左側的「Pages」**。
2. **Source** 選擇 **「GitHub Actions」**。

### 4. 觸發自動部署
當你做了以上設定並將所有變更 git push 上去（或從 Actions 面板點擊 manually `Run workflow`）之後，GitHub Actions 就會為你打包並上傳至免費的線上空間！

---

## 🤖 附錄：測試題目庫（生成式 AI 基礎知識）

你可以直接將下方的表格內容框選複製，並貼進你的 Google Sheets「題目」工作表中（記得覆蓋對應的欄位）：

| 題號 | 題目 | A | B | C | D | 解答 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 生成式 AI（Generative AI）最主要的功能是什麼？| 壓縮檔案 | 創造全新的文字、圖像或音訊內容 | 加速電腦開機時間 | 修復受損的硬碟磁區 | B |
| 2 | ChatGPT 的底層技術「LLM」代表什麼意思？| Large Language Model | Low Level Machine | Linear Logic Method | Late Learning Module | A |
| 3 | 在與 AI 互動時，我們給予的指令通常稱為什麼？| 密碼 (Password) | 觸發器 (Trigger) | 提示詞 (Prompt) | 後門 (Backdoor) | C |
| 4 | 下列哪一項**不是**目前常見的生成式 AI 應用模型？| Midjourney | GPT-4 | Stable Diffusion | WinRAR | D |
| 5 | 「AI 幻覺（AI Hallucination）」指的是什麼現象？| AI 模型運行過熱導致當機 | AI 產生出看似合理但實際上不準確或捏造的資訊 | AI 開始具備自我意識 | AI 拒絕回答人類所有問題 | B |
| 6 | 若想讓生成式 AI 畫出一張「賽博龐克風格的貓咪」，應該使用下列哪種模型？| 大型語言模型 (如 ChatGPT) | 文生圖模型 (如 DALL-E) | 語音轉文字模型 (如 Whisper) | 文字轉語音模型 (如 TTS) | B |
| 7 | 在訓練 AI 模型時，「微調（Fine-tuning）」的目的是什麼？| 把模型檔案壓縮變小 | 讓基礎模型適應特定領域或任務的需求 | 將 AI 初始化回出廠設定 | 更改模型的介面顏色 | B |
| 8 | 下列關於 AI 著作權的敘述，目前多數情況下何者較為正確？| AI 生成的作品必定屬於提示詞作者 | AI 產生的原始素材目前在多國通常不具備版權 | AI 可以自行註冊專利商標 | 生成AI 作品無需考慮輸入資料的侵權問題 | B |
| 9 | 「RAG（檢索增強生成）」技術如何改善語言模型回答問題的準確性？| 增加模型的參數量 | 強制它去圖書館借書 | 在生成回答前，先從外部資料庫檢索並提取相關事實 | 封鎖所有錯誤資訊來源 | C |
| 10 | AI 模型的「Token（權杖 / 詞元）」在語言處理中代表什麼？| 模型伺服器的登入密碼 | 文本處理的最小單位（可能是一個詞或片段） | 一種加密貨幣 | AI 回答問題時獲得的獎勵點數 | B |

祝你測試順利！🎉
