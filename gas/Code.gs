/**
 * ============================================================
 * PIXEL QUIZ — Google Apps Script 後端
 * ============================================================
 * 部署方式：
 *   1. 在 Google Sheets 中點選「擴充功能 > Apps Script」
 *   2. 貼上本檔案全部內容，覆蓋預設的 Code.gs
 *   3. 點選「部署 > 新增部署作業」
 *      - 類型：網路應用程式
 *      - 執行身分：我（你的 Google 帳號）
 *      - 存取權：所有人（包含匿名）
 *   4. 複製部署 URL，填入前端 .env 的 VITE_GAS_URL
 * ============================================================
 *
 * Google Sheets 工作表結構：
 *   「題目」工作表：  A=題號, B=題目, C=A選項, D=B選項, E=C選項, F=D選項, G=解答
 *   「回答」工作表：  A=ID, B=闖關次數, C=總分, D=最高分, E=第一次通關分數, F=花了幾次通關, G=最近遊玩時間
 */

// ─── 工作表名稱常量 ───────────────────────────────────────────
var SHEET_QUESTIONS = '題目'
var SHEET_ANSWERS   = '回答'

// 通關正確率門檻（百分比，與前端 VITE_PASS_THRESHOLD 保持一致）
var PASS_THRESHOLD = 70


// ─── 跨域設定 Helper ──────────────────────────────────────────
/**
 * 建立含 CORS header 的 JSON 回應
 * @param {object} data
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse(data) {
  var output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
  return output
}


// ─── doGet：取得隨機題目 ──────────────────────────────────────
/**
 * 前端 GET 請求，回傳隨機 N 題（不含解答欄）
 *
 * Query Params:
 *   action=getQuestions
 *   count=10
 *
 * Response:
 *   { questions: [ { id, text, options: {A,B,C,D} } ] }
 */
function doGet(e) {
  try {
    var action = e.parameter.action
    if (action !== 'getQuestions') {
      return jsonResponse({ error: 'Unknown action: ' + action })
    }

    var count = parseInt(e.parameter.count, 10) || 10
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = ss.getSheetByName(SHEET_QUESTIONS)

    if (!sheet) {
      return jsonResponse({ error: '找不到「' + SHEET_QUESTIONS + '」工作表' })
    }

    // 取得所有資料列（第 2 列起，跳過標題）
    var lastRow = sheet.getLastRow()
    if (lastRow < 2) {
      return jsonResponse({ questions: [] })
    }

    var allData = sheet.getRange(2, 1, lastRow - 1, 6).getValues()
    // NOTE: 只取前 6 欄（題號~D選項），第 7 欄解答不傳出，防止作弊

    // Fisher-Yates 洗牌後取前 count 筆
    var shuffled = shuffleArray(allData)
    var selected = shuffled.slice(0, Math.min(count, shuffled.length))

    var questions = selected.map(function(row) {
      return {
        id: row[0],           // 題號
        text: row[1],         // 題目
        options: {
          A: row[2],
          B: row[3],
          C: row[4],
          D: row[5]
        }
      }
    })

    return jsonResponse({ questions: questions })

  } catch (err) {
    return jsonResponse({ error: 'doGet error: ' + err.message })
  }
}


// ─── doPost：提交答案、計算分數、寫入回答表 ──────────────────
/**
 * 前端 POST 請求，計算成績並寫入 Google Sheets
 *
 * POST body (application/x-www-form-urlencoded):
 *   action=submitAnswers
 *   payload={"playerId":"xxx","answers":{1:"A",2:"C",...},"totalQuestions":10}
 *
 * Response:
 *   { correctCount, totalQuestions, passed, accuracy }
 */
function doPost(e) {
  try {
    var action = e.parameter.action
    if (action !== 'submitAnswers') {
      return jsonResponse({ error: 'Unknown action: ' + action })
    }

    var payload = JSON.parse(e.parameter.payload)
    var playerId       = payload.playerId
    var answers        = payload.answers        // { "題號": "選項字母" }
    var totalQuestions = payload.totalQuestions

    if (!playerId || !answers) {
      return jsonResponse({ error: '缺少必要欄位 playerId / answers' })
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var qSheet = ss.getSheetByName(SHEET_QUESTIONS)
    var aSheet = ss.getSheetByName(SHEET_ANSWERS)

    if (!qSheet || !aSheet) {
      return jsonResponse({ error: '工作表不存在，請確認「題目」與「回答」工作表名稱' })
    }

    // ── 1. 撈出所有題目的解答 ────────────────────────────────
    var lastRow = qSheet.getLastRow()
    var answerMap = {}  // { 題號: 解答字母 }

    if (lastRow >= 2) {
      var qData = qSheet.getRange(2, 1, lastRow - 1, 7).getValues()
      qData.forEach(function(row) {
        var qId     = String(row[0])
        var correct = String(row[6]).trim().toUpperCase()  // G欄：解答
        answerMap[qId] = correct
      })
    }

    // ── 2. 計算正確數 ─────────────────────────────────────────
    var correctCount = 0
    Object.keys(answers).forEach(function(qId) {
      var userAnswer = String(answers[qId]).trim().toUpperCase()
      var correctAnswer = answerMap[qId]
      if (correctAnswer && userAnswer === correctAnswer) {
        correctCount++
      }
    })

    var accuracy = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0
    var passed = accuracy >= PASS_THRESHOLD

    // ── 3. 寫入「回答」工作表 ─────────────────────────────────
    var now = new Date()
    var aLastRow = aSheet.getLastRow()
    var existingRow = -1

    // 尋找同 ID 的既有記錄（從第 2 列起）
    if (aLastRow >= 2) {
      var aData = aSheet.getRange(2, 1, aLastRow - 1, 1).getValues()
      for (var i = 0; i < aData.length; i++) {
        if (String(aData[i][0]) === String(playerId)) {
          existingRow = i + 2  // 1-indexed + 跳標題
          break
        }
      }
    }

    if (existingRow === -1) {
      // ── 新玩家：直接新增一列 ─────────────────────────────
      var newRow = [
        playerId,           // A: ID
        1,                  // B: 闖關次數
        correctCount,       // C: 總分（此處以答對題數計）
        correctCount,       // D: 最高分
        passed ? correctCount : '',  // E: 第一次通關分數（沒通關留空）
        passed ? 1 : '',    // F: 花了幾次通關
        now                 // G: 最近遊玩時間
      ]
      aSheet.appendRow(newRow)

    } else {
      // ── 既有玩家：更新該列 ───────────────────────────────
      var row = aSheet.getRange(existingRow, 1, 1, 7).getValues()[0]

      var prevAttempts   = Number(row[1]) || 0
      var prevTotalScore = Number(row[2]) || 0
      var prevHighScore  = Number(row[3]) || 0
      var prevFirstClear = row[4]   // 第一次通關分數（可能為空）
      var prevClearTries = row[5]   // 花了幾次通關（可能為空）

      var newAttempts   = prevAttempts + 1
      var newTotalScore = prevTotalScore + correctCount
      var newHighScore  = Math.max(prevHighScore, correctCount)

      // NOTE: 第一次通關分數僅在「之前未通關且本次通關」時寫入，後續不覆蓋
      var newFirstClear = prevFirstClear
      var newClearTries = prevClearTries
      if (passed && (prevFirstClear === '' || prevFirstClear === null || prevFirstClear === undefined)) {
        newFirstClear = correctCount
        newClearTries = newAttempts
      }

      aSheet.getRange(existingRow, 1, 1, 7).setValues([[
        playerId,
        newAttempts,
        newTotalScore,
        newHighScore,
        newFirstClear,
        newClearTries,
        now
      ]])
    }

    return jsonResponse({
      correctCount:   correctCount,
      totalQuestions: totalQuestions,
      passed:         passed,
      accuracy:       accuracy
    })

  } catch (err) {
    return jsonResponse({ error: 'doPost error: ' + err.message })
  }
}


// ─── 工具函數 ─────────────────────────────────────────────────
/**
 * Fisher-Yates 洗牌（原地修改）
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
  var a = arr.slice()
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = a[i]
    a[i] = a[j]
    a[j] = temp
  }
  return a
}
