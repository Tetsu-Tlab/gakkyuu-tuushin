/**
 * 学級通信メーカー：API（バグ修正済み決定版）
 */

function doGet(e) {
    var action = e.parameter.action;
    var callback = e.parameter.callback;

    var data = { error: "No action specified" };

    if (action === "load") {
        data = loadFromSheet();
    }

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
    // 授業進捗管理シートからの「未実施授業」受け取り
    if (params.action === "receiveProgress") {
        var result = storePendingUnits(params.grade, params.subject, params.units);
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * 授業進捗管理シートから送られた未実施授業を「未実施授業DB」シートに保存
 */
function storePendingUnits(grade, subject, units) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName("未実施授業DB");
        if (!sheet) {
            sheet = ss.insertSheet("未実施授業DB");
            sheet.appendRow(["学年", "教科", "時数", "単元名", "学習内容", "登録日時"]);
        }
        // 同じ学年・教科の既存データを削除して上書き
        var data = sheet.getDataRange().getValues();
        var toDelete = [];
        for (var i = data.length - 1; i >= 1; i--) {
            if (data[i][0] === grade && data[i][1] === subject) {
                toDelete.push(i + 1);
            }
        }
        toDelete.forEach(function(row) { sheet.deleteRow(row); });
        // 新しいデータを追加
        var now = new Date();
        units.forEach(function(u) {
            sheet.appendRow([grade, subject, u.period, u.title, u.content, now]);
        });
        return { success: true, count: units.length };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

function loadFromSheet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("入力シート");
    if (!sheet) return { error: "入力シートが見つかりません" };

    var values = sheet.getRange("A3:F20").getValues();

    // 日付のフォーマット（getUi()を使わない安全な方法！）
    var dateVal = values[0][2];
    var dateStr = "";
    if (dateVal instanceof Date) {
        dateStr = dateVal.getFullYear() + "年" + (dateVal.getMonth() + 1) + "月" + dateVal.getDate() + "日";
    } else {
        dateStr = String(dateVal || new Date().getFullYear() + "年");
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

// 時刻データ（Dateオブジェクト）から "HH:MM" を取り出す魔法
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
        // 時刻Dateオブジェクトが混入していたら無視する
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
