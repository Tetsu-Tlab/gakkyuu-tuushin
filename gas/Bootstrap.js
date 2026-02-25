/**
 * 学級通信メーカー：スプレッドシート初期構築スクリプト（下校時間プルダウン対応版）
 */

function initSpreadsheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. マスタ設定シート
    setupMasterSheet(ss);
    // 2. 履歴シート
    setupHistorySheet(ss);
    // 3. 入力シート（メイン）
    setupInputSheet(ss);

    Browser.msgBox("下校時間のプルダウン追加も完了しました！「入力シート」を確認してください。");
}

function setupInputSheet(ss) {
    let sheet = ss.getSheetByName("入力シート");
    if (!sheet) {
        sheet = ss.insertSheet("入力シート", 0);
    } else {
        sheet.clear();
    }

    const range = sheet.getRange("A1:G30");
    range.setFontFamily("MS Gothic").setWrap(true).setVerticalAlignment("middle");

    // ヘッダー
    sheet.getRange("A1:G1").merge().setValue("学級通信 入力ダッシュボード").setBackground("#4a7c59").setFontColor("white").setFontSize(16).setHorizontalAlignment("center");
    sheet.getRange("A2:G2").setValues([["タイトル", "号数", "発行日", "", "年度", "クラス", ""]]).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange("A3:G3").setValues([["にじいろ日記", 1, "=TODAY()", "", "8", "4-1", ""]]).setHorizontalAlignment("center");
    sheet.getRange("B3").setBackground("#fff2cc");

    // メッセージ
    sheet.getRange("A5:G5").merge().setValue("担任メッセージ").setBackground("#d4a373").setFontColor("white").setFontWeight("bold");
    sheet.getRange("A6:G9").merge().setValue("今週もよく頑張りました！").setVerticalAlignment("top").setBackground("#fffcf5");

    // 時間割
    sheet.getRange("A11:G11").merge().setValue("来週の時間割").setBackground("#4a7c59").setFontColor("white").setFontWeight("bold");
    sheet.getRange("A12:G12").setValues([["校時", "月", "火", "水", "木", "金", "土"]]).setBackground("#f3f3f3").setHorizontalAlignment("center").setFontWeight("bold");

    for (let i = 1; i <= 7; i++) {
        sheet.getRange(12 + i, 1).setValue(i + "限").setBackground("#f3f3f3").setHorizontalAlignment("center");
    }
    sheet.getRange("A20").setValue("下校").setBackground("#f3f3f3").setHorizontalAlignment("center");

    // --- プルダウン設定 ---
    const masterSheet = ss.getSheetByName("マスタ設定");

    // 教科プルダウン (B13:G19)
    const subjectRule = SpreadsheetApp.newDataValidation().requireValueInRange(masterSheet.getRange("A2:A20")).build();
    sheet.getRange("B13:G19").setDataValidation(subjectRule).setBackground("#ffffff");

    // 下校時間プルダウン (B20:G20) ★追加
    const dismissalRule = SpreadsheetApp.newDataValidation().requireValueInRange(masterSheet.getRange("C2:C10")).build();
    sheet.getRange("B20:G20").setDataValidation(dismissalRule).setBackground("#fff9e6").setHorizontalAlignment("center");

    // 初期値のセット
    sheet.getRange("B20:G20").setValues([["14:50", "15:45", "15:45", "15:45", "15:45", "12:15"]]);

    sheet.setColumnWidths(2, 6, 120);
    sheet.setRowHeights(13, 7, 60);

    // お知らせ
    sheet.getRange("A22:G22").merge().setValue("お知らせ・連絡事項").setBackground("#d4a373").setFontColor("white").setFontWeight("bold");
    sheet.getRange("A23:G26").merge().setValue("・月曜日：全校朝会").setVerticalAlignment("top").setBackground("#fffcf5");

    sheet.getRange("A12:G20").setBorder(true, true, true, true, true, true, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
}

function setupMasterSheet(ss) {
    let sheet = ss.getSheetByName("マスタ設定");
    if (!sheet) sheet = ss.insertSheet("マスタ設定");
    sheet.clear();

    // 下校時間のリストもマスタに追加
    const data = [
        ["教科リスト", "担任名", "下校時間リスト"],
        ["国語", "先生の名前", "14:50"],
        ["算数", "", "15:45"],
        ["社会", "", "13:30"],
        ["理科", "", "12:15"],
        ["音楽", "", "11:30"],
        ["図工", "", ""],
        ["体育", "", ""],
        ["道徳", "", ""],
        ["外国語", "", ""],
        ["総合", "", ""],
        ["学活", "", ""],
        ["書写", "", ""],
        ["生活", "", ""],
        ["-", "", ""]
    ];
    sheet.getRange(1, 1, data.length, 3).setValues(data);
    sheet.getRange("A1:C1").setBackground("#eeeeee").setFontWeight("bold");
}

function setupHistorySheet(ss) {
    let sheet = ss.getSheetByName("記録DB");
    if (!sheet) sheet = ss.insertSheet("記録DB");
    if (sheet.getLastRow() === 0) {
        const headers = ["号数", "年度", "クラス", "タイトル", "日付", "メッセージ", "時間割データ(JSON)", "お知らせ", "保存日時"];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground("#444444").setFontColor("white").setFontWeight("bold");
        sheet.setFrozenRows(1);
    }
}
