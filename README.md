# 🌈 学級通信メーカー「にじいろ日記」

**スプレッドシートに入力するだけで、A3横の学級通信が自動で完成するツールです！**

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![GAS](https://img.shields.io/badge/Google_Apps_Script-4285F4?style=flat&logo=google&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

---

## ✨ できること

- 📝 スプシに入力 → アプリで読み込み → 即印刷！
- 📅 月曜の日付を入れるだけで火〜金が自動入力
- 📸 写真を貼り付けられる（1枚でも2枚でもOK）
- 🖨️ A3横で印刷するだけの簡単レイアウト
- 💾 「保存＆次号へ」で履歴がスプシに自動記録

---

## 🚀 セットアップ手順（初めての方はここから！）

### ステップ1：スプレッドシートをコピーする（1分）

1. 以下のリンクを開きます：
   - 📊 [テンプレートスプレッドシート](https://docs.google.com/spreadsheets/d/1wc2bDiUVGm6h8hv83OR0mwEAARlDTLiJcgYDrVNVi2M/edit?usp=sharing)
2. **「ファイル」→「コピーを作成」** をクリック
3. 自分のGoogleドライブにコピーが作られます
4. コピーしたスプシを開いておいてください

---

### ステップ2：GASのスクリプトをコピーする（2分）

コピーしたスプシの中にスクリプトを設定します。

1. コピーしたスプシで **「拡張機能」→「Apps Script」** を開く
2. 表示されたコードエディタに、以下の2つのファイルを作成します：

#### 📄 ファイル1：`Code.gs`（メインのコードを全部貼り替え）

```javascript
function doGet(e) {
    var action = e.parameter.action;
    var callback = e.parameter.callback;
    var data = { error: "No action specified" };
    if (action === "load") { data = loadFromSheet(); }
    var jsonResponse = JSON.stringify(data);
    var result = callback ? callback + "(" + jsonResponse + ")" : jsonResponse;
    var mimeType = callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON;
    return ContentService.createTextOutput(result).setMimeType(mimeType);
}

function doPost(e) {
    var params = JSON.parse(e.postData.contents);
    if (params.action === "save") {
        var result = saveToSheet(params.payload);
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
}

function loadFromSheet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("入力シート");
    if (!sheet) return { error: "入力シートが見つかりません" };
    var values = sheet.getRange("A3:F20").getValues();
    var dateVal = values[0][2];
    var dateStr = "";
    if (dateVal instanceof Date) {
        dateStr = dateVal.getFullYear() + "年" + (dateVal.getMonth() + 1) + "月" + dateVal.getDate() + "日";
    } else {
        dateStr = String(dateVal || "");
    }
    return {
        title: values[0][0] || "にじいろ日記",
        issueNumber: values[0][1] || "1",
        date: dateStr,
        teacherMessage: sheet.getRange("A6").getValue() || "",
        wideNotes: sheet.getRange("A23").getValue() || "",
        schedule: [
            { day: "月", dismissal: formatTime(values[17][1]), periods: getPeriods(sheet, 2) },
            { day: "火", dismissal: formatTime(values[17][2]), periods: getPeriods(sheet, 3) },
            { day: "水", dismissal: formatTime(values[17][3]), periods: getPeriods(sheet, 4) },
            { day: "木", dismissal: formatTime(values[17][4]), periods: getPeriods(sheet, 5) },
            { day: "金", dismissal: formatTime(values[17][5]), periods: getPeriods(sheet, 6) }
        ]
    };
}

function formatTime(val) {
    if (val instanceof Date) {
        var h = val.getHours();
        var m = val.getMinutes();
        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
    }
    return String(val || "15:45");
}

function getPeriods(sheet, colIndex) {
    var data = sheet.getRange(13, colIndex, 8, 1).getValues();
    return data.map(function (row) {
        var val = row[0];
        if (val instanceof Date) return { sub: "", unit: "" };
        return { sub: String(val || ""), unit: "" };
    });
}

function saveToSheet(payload) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("入力シート");
    var historySheet = ss.getSheetByName("記録DB");
    sheet.getRange("B3").setValue(payload.issueNumber);
    historySheet.appendRow([payload.issueNumber, payload.config.reiwa, payload.config.gradeClass, payload.title, new Date(), payload.teacherMessage, JSON.stringify(payload.schedule), payload.wideNotes, new Date()]);
    return { success: true };
}
```

---

### ステップ3：スクリプトを承認する（30秒）

1. Apps Scriptエディタの上部で、関数の選択を **`doGet`** にする
2. **「▶ 実行」** ボタンをクリック
3. 「承認が必要です」というダイアログが出たら、以下の流れで進めてください：
   - **「権限を確認」** をクリック
   - 自分のGoogleアカウントを選択
   - **「詳細」** をクリック（左下の小さい文字）
   - **「〇〇（安全ではないページ）に移動」** をクリック
   - **「許可」** をクリック
4. 実行ログに何かエラーが出ても気にしなくてOK！（承認だけが目的です）

---

### ステップ4：Webアプリとしてデプロイする（1分）⭐最重要！

1. Apps Scriptエディタの右上の青い **「デプロイ」** ボタンをクリック
2. **「新しいデプロイ」** を選択
3. 左の歯車アイコンをクリックして **「ウェブアプリ」** を選択
4. 以下のように設定します：

| 項目 | 設定値 |
|------|--------|
| 説明 | `学級通信メーカー` （何でもOK） |
| 次のユーザーとして実行 | **自分** |
| アクセスできるユーザー | ⚠️ **「全員」（Anyone）** ← ここが超重要！ |

5. **「デプロイ」** をクリック
6. 表示された **「ウェブアプリ URL」** をコピーします
   - `https://script.google.com/macros/s/xxxxxxx/exec` という形式です

> ⚠️ **「自分のみ」ではなく「全員」にしないと、アプリから接続できません！**

---

### ステップ5：アプリにURLを設定する（15秒）

1. アプリを開く（`npm run dev` → `http://localhost:5173`）
2. 右上の **⚙️歯車アイコン** をクリック
3. ステップ4でコピーした **URLを貼り付ける**
4. **「閉じる」** をクリック

---

### ステップ6：動作確認 🎉

1. スプシの「入力シート」に何か入力してみる
   - 例：A6セルに「今週もよく頑張りました！」
2. アプリの **「スプシから読込」** ボタンをクリック
3. **スプシの内容がアプリに反映されたら成功です！** 🎊

---

## 📖 使い方

### 毎週の流れ

```
1. スプシに来週の時間割や担任メッセージを入力
2. アプリで「スプシから読込」をクリック
3. 写真があれば追加
4. 「印刷」ボタンでA3横でプリント！ 🖨️
5. 「保存＆次号へ」で履歴保存＆号数自動カウントアップ
```

### 便利機能

| 機能 | 操作 |
|------|------|
| 📅 発行日を変更 | 日付の横のカレンダーアイコンをクリック |
| 📅 時間割の日付 | 月曜の日付（例：3/2）を入力 → 火〜金が自動入力 |
| 🔍 ズーム | スライダーで画面の拡大・縮小 |
| 🔤 文字サイズ | スライダーで文字の大きさを調整 |
| 📸 写真追加 | 点線エリアをクリックして画像を選択 |

---

## 🛠 開発環境セットアップ（開発者向け）

```bash
# リポジトリをクローン
git clone https://github.com/Tetsu-Tlab/gakkyuu-tuushin.git
cd gakkyuu-tuushin

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

---

## 📁 ファイル構成

```
gakkyuu-tuushin/
├── src/
│   ├── App.jsx        # メインアプリ（React）
│   ├── index.css      # スタイル（A3レイアウト）
│   └── main.jsx       # エントリポイント
├── gas/
│   ├── Code.js        # GAS API（読込・保存）
│   ├── Bootstrap.js   # スプシ初期設定
│   └── appsscript.json # GAS設定
├── index.html
├── package.json
└── vite.config.js
```

---

## ❓ よくある質問

### Q: 「読み込みに失敗しました」と表示されます
**A:** 以下を確認してください：
1. 歯車に貼ったURLが `https://script.google.com/macros/s/.../exec` で終わっていますか？
2. デプロイ時に「アクセスできるユーザー」を **「全員」** にしましたか？
3. ステップ3の「スクリプトの承認」は完了していますか？

### Q: 下校時刻が「Sat Dec 30」のように表示されます
**A:** 最新のCode.gsに更新してください。古いバージョンには時刻変換のバグがありました。

### Q: スプシを変更したのに反映されません
**A:** もう一度「スプシから読込」を押してください。自動同期ではなく、ボタンで手動同期する仕組みです。

---

## 🌈 作者

**T-Lab** - 先生のための、先生による、先生のアプリ

---

*Made with ❤️ for teachers everywhere* 🍎
