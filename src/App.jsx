import React, { useState, useRef, useEffect } from 'react';
import { Printer, FileSpreadsheet, Image as ImageIcon, Plus, Trash2, Calendar, Settings, Sparkles, ZoomIn, ZoomOut, Save, Type, X, FolderOpen, Database, RefreshCw, AlertCircle, ExternalLink, CheckCircle2, Copy, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [config, setConfig] = useState({
    gradeClass: "4年1組",
    showSaturday: false,
    show7th: false,
    gasUrl: localStorage.getItem('gasUrl') || "",
    reiwa: 8
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(0.45);
  const [contentScale, setContentScale] = useState(1.0);

  const [newsData, setNewsData] = useState({
    title: "にじいろ日記",
    issueNumber: "1",
    date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
    teacherMessage: "スプシから読み出すと、ここに内容が表示されます！",
    activities: [{ id: 1, content: "「スプシから読込」ボタンを押してください。" }],
    schedule: Array(6).fill(0).map((_, i) => ({
      day: ["月", "火", "水", "木", "金", "土"][i],
      date: "",
      dismissal: "15:45",
      periods: Array(8).fill(0).map(() => ({ sub: "", unit: "" }))
    })),
    wideNotes: "【来週の予定・連絡事項】"
  });

  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (config.gasUrl) {
      localStorage.setItem('gasUrl', config.gasUrl.trim());
    } else {
      // 初回起動時やURL未設定時にガイドを推奨する
      setShowGuide(!localStorage.getItem('gasUrl'));
    }
  }, [config.gasUrl]);

  // --- 絶対に繋がるJSONP読み込みの魔法 ---
  const loadFromGoogle = async () => {
    const url = config.gasUrl.trim();
    if (!url || !url.includes("exec")) {
      setShowSettings(true);
      setShowGuide(true);
      return;
    }

    setIsLoading(true);
    const callbackName = 'callback_' + Math.round(100000 * Math.random());

    window[callbackName] = (data) => {
      delete window[callbackName];
      const script = document.getElementById('jsonp-script');
      if (script) document.body.removeChild(script);

      if (data.error) {
        alert("スプシよりエラー: " + data.error);
      } else {
        setNewsData(prev => ({ ...prev, ...data }));
        // 成功感のあるアラート（本当はトーストUIがいいけど一旦alertで）
        setTimeout(() => alert("スプシから読み込みました！✨🌈"), 100);
      }
      setIsLoading(false);
    };

    const script = document.createElement('script');
    script.id = 'jsonp-script';
    script.src = `${url}?action=load&callback=${callbackName}`;
    script.onerror = () => {
      alert("スプシに繋げませんでした。URLが正しいか確認してね！");
      setIsLoading(false);
    };
    document.body.appendChild(script);
  };

  const saveToGoogle = async () => {
    const url = config.gasUrl.trim();
    if (!url || !url.includes("exec")) {
      setShowSettings(true);
      setShowGuide(true);
      return;
    }
    setIsSaving(true);
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ action: "save", payload: { ...newsData, config } })
      });
      alert("データを送信しました！スプシをチェックしてね！");
      setNewsData(prev => ({ ...prev, issueNumber: Number(prev.issueNumber) + 1 }));
    } catch (e) {
      alert("送信失敗。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubjectChange = (dayIdx, pIdx, newSub) => {
    const updatedSchedule = [...newsData.schedule];
    updatedSchedule[dayIdx].periods[pIdx].sub = newSub;
    setNewsData({ ...newsData, schedule: updatedSchedule });
  };
  const handleUnitChange = (dayIdx, pIdx, newUnit) => {
    const updatedSchedule = [...newsData.schedule];
    updatedSchedule[dayIdx].periods[pIdx].unit = newUnit;
    setNewsData({ ...newsData, schedule: updatedSchedule });
  };
  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImageUrls]);
  };
  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const periodRows = [1, 2, 3, 4, 5, 6];
  if (config.show7th) periodRows.push(7);

  const GuideSteps = () => (
    <div className="guide-container">
      <div className={`guide-step ${!config.gasUrl ? 'active' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-content">
          <h4>スプレッドシートをコピー</h4>
          <p>まずは土台となる管理シートを自分のGoogleドライブにコピーしましょう！</p>
          <a href="https://docs.google.com/spreadsheets/d/1wc2bDiUVGm6h8hv83OR0mwEAARlDTLiJcgYDrVNVi2M/copy" target="_blank" rel="noopener noreferrer" className="guide-link">
            <Copy size={16} /> シートをコピーする
          </a>
        </div>
      </div>
      <div className="guide-step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h4>Webアプリとして公開</h4>
          <p>スプシの「拡張機能」→「Apps Script」を開き、青い「デプロイ」ボタンから「ウェブアプリ」として公開します。</p>
          <p style={{ fontSize: '0.8rem', color: '#e53e3e', fontWeight: 'bold', marginTop: '4px' }}>※アクセスできるユーザーを「全員(Anyone)」にするのがコツです！</p>
        </div>
      </div>
      <div className="guide-step">
        <div className="step-number">3</div>
        <div className="step-content">
          <h4>URLをここに貼り付け</h4>
          <p>発行された「ウェブアプリURL」をコピーして、下の入力欄に貼り付ければ完了です！🚀</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* 操作パネル */}
      <div className="header-controls no-print">
        <div className="control-group">
          <motion.button whileHover={{ y: -2 }} className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={20} /> 印刷
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }} className="btn" onClick={loadFromGoogle} disabled={isLoading}
            style={{ background: '#f0fdf4', color: '#166534', border: '2px solid #bbf7d0' }}
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /> {isLoading ? "読込中..." : "スプシから読込"}
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }} className="btn" onClick={saveToGoogle} disabled={isSaving}
            style={{ background: '#eff6ff', color: '#1e40af', border: '2px solid #bfdbfe' }}
          >
            <Save size={20} /> {isSaving ? "保存中..." : "保存＆次号へ"}
          </motion.button>
        </div>

        <div className="control-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
            <ZoomOut size={16} color="#64748b" />
            <input type="range" min="0.2" max="1.0" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: '60px' }} />
            <ZoomIn size={16} color="#64748b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', padding: '6px 12px', borderRadius: '12px', border: '1.5px solid #fde68a' }}>
            <Type size={16} color="#b45309" />
            <input type="range" min="0.7" max="1.3" step="0.05" value={contentScale} onChange={(e) => setContentScale(parseFloat(e.target.value))} style={{ width: '60px' }} />
          </div>
          <motion.button
            whileHover={{ rotate: 90 }} onClick={() => setShowSettings(true)}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #e2e8f0' }}
          >
            <Settings size={22} color="#475569" />
          </motion.button>
        </div>
      </div>

      {/* 初期セットアップバナー */}
      {!config.gasUrl && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="setup-banner no-print"
        >
          <div className="setup-banner-content">
            <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', color: '#166534' }}>
              <Rocket size={24} />
            </div>
            <div>
              <h3>スプレッドシートと連携しましょう！</h3>
              <p>連携すると、時間割やメッセージを自動で読み込めるようになります ✨</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowSettings(true); setShowGuide(true); }}>
            設定ガイドを開く
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showSettings && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{showGuide ? "らくらく連携ガイド" : "連携設定"}</h2>
                  {config.gasUrl && (
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> 連携済み
                    </span>
                  )}
                </div>
                <button onClick={() => setShowSettings(false)} className="btn" style={{ padding: '0.5rem' }}><X size={20} /></button>
              </div>

              {showGuide ? (
                <>
                  <GuideSteps />
                  <div style={{ marginTop: '2rem', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <label className="input-label">コピーしたURLをここに貼り付け</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        className="modal-input"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={config.gasUrl}
                        onChange={e => setConfig({ ...config, gasUrl: e.target.value })}
                      />
                    </div>
                    <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                      ※URLはブラウザのLocalStorageに安全に保存されます。
                    </p>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => { setShowSettings(false); setShowGuide(false); }}>
                    設定を完了して閉じる
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label className="input-label">GAS Webアプリ URL</label>
                    <input className="modal-input" value={config.gasUrl} onChange={e => setConfig({ ...config, gasUrl: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label className="input-label">学級名</label>
                      <input className="modal-input" value={config.gradeClass} onChange={e => setConfig({ ...config, gradeClass: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="input-label">令和（年度）</label>
                      <input type="number" className="modal-input" value={config.reiwa} onChange={e => setConfig({ ...config, reiwa: e.target.value })} />
                    </div>
                  </div>
                  <button className="btn" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }} onClick={() => setShowGuide(true)}>
                    <Sparkles size={18} color="#d69e2e" /> 連携ガイドを表示する
                  </button>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setShowSettings(false)}>
                    閉じる
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', marginBottom: '100px' }}>
        <div className="page-sheet">
          <div className="left-side">
            <header style={{ borderBottom: '4px solid var(--accent-color)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label style={{ fontSize: '1.1rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={18} color="#64748b" className="no-print" />
                  <span>{newsData.date}</span>
                  <input
                    type="date"
                    className="no-print"
                    onChange={e => {
                      if (e.target.value) {
                        const d = new Date(e.target.value + "T00:00:00");
                        const formatted = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
                        setNewsData({ ...newsData, date: formatted });
                      }
                    }}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem', color: '#64748b' }}>{config.gradeClass}</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>第 {newsData.issueNumber} 号</span>
                </div>
              </div>
              <input className="main-title-input" value={newsData.title} onChange={e => setNewsData({ ...newsData, title: e.target.value })} />
            </header>
            <section style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid #fef3c7', fontSize: `${contentScale}rem` }}>
              <h3 style={{ fontSize: '1.1em', color: '#92400e', fontWeight: 'bold' }}>担任メッセージ</h3>
              <textarea value={newsData.teacherMessage} onChange={e => setNewsData({ ...newsData, teacherMessage: e.target.value })} style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '1.05em', lineHeight: '1.7', resize: 'none', height: '140px', outline: 'none' }} />
            </section>
            <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, fontSize: `${contentScale}rem` }}>
              <h3 style={{ borderBottom: '2px solid var(--highlight-color)', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '1.4em', fontWeight: 'bold' }}>活動の記録</h3>
              {newsData.activities.map((act, idx) => (
                <div key={idx} style={{ marginBottom: '0.8rem', fontSize: '1.1rem', display: 'flex' }}>
                  <span style={{ marginRight: '10px', color: 'var(--accent-color)' }}>◆</span>
                  <textarea value={act.content} onChange={e => {
                    const newActs = [...newsData.activities]; newActs[idx].content = e.target.value; setNewsData({ ...newsData, activities: newActs });
                  }} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 'inherit', outline: 'none', resize: 'none', lineHeight: '1.5' }} rows={2} />
                </div>
              ))}
              <div className="image-gallery">
                {images.map((url, idx) => (
                  <div key={idx} className="gallery-item">
                    <img src={url} alt="" /><button className="no-print" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 10, right: 10, border: 'none', borderRadius: '50%', background: 'white' }}><Trash2 size={14} color="red" /></button>
                  </div>
                ))}
                {images.length < 2 && <div onClick={() => fileInputRef.current.click()} className="no-print gallery-item" style={{ border: '3px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ImageIcon size={40} color="#ccc" /><input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleImageAdd} /></div>}
              </div>
            </section>
          </div>
          <div className="right-side">
            <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>【来週の予定】</h2>
            <table className="timetable-table" style={{ fontSize: `${contentScale}rem` }}>
              <thead><tr><th style={{ width: '50px' }}></th>{newsData.schedule.slice(0, 5).map((s, dIdx) => (
                <th key={s.day} style={{ padding: '6px 2px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{s.day}</div>
                  <input
                    value={s.date || ""}
                    onChange={e => {
                      const newSched = [...newsData.schedule];
                      newSched[dIdx].date = e.target.value;

                      // 月曜（0番目）を入力したら、火〜金を自動計算！
                      if (dIdx === 0 && e.target.value) {
                        const parts = e.target.value.split("/");
                        if (parts.length === 2) {
                          const month = parseInt(parts[0]);
                          const day = parseInt(parts[1]);
                          if (!isNaN(month) && !isNaN(day)) {
                            const baseDate = new Date(new Date().getFullYear(), month - 1, day);
                            for (let i = 1; i < 5; i++) {
                              const nextDate = new Date(baseDate);
                              nextDate.setDate(baseDate.getDate() + i);
                              newSched[i].date = (nextDate.getMonth() + 1) + "/" + nextDate.getDate();
                            }
                          }
                        }
                      }

                      setNewsData({ ...newsData, schedule: newSched });
                    }}
                    placeholder={dIdx === 0 ? "3/2 ←入力" : "自動"}
                    style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontSize: '1.05em', fontWeight: '600', color: '#2d3748', outline: 'none', fontFamily: 'inherit' }}
                  />
                </th>
              ))}</tr></thead>
              <tbody>
                <tr className="row-morning"><td>朝活</td>{newsData.schedule.slice(0, 5).map((s, dIdx) => (<td key={dIdx}><input className="cell-input-subject" value={s.periods[0].sub} onChange={e => handleSubjectChange(dIdx, 0, e.target.value)} /></td>))}</tr>
                {periodRows.map(pIdx => (<tr key={pIdx}><td>{pIdx}</td>{newsData.schedule.slice(0, 5).map((s, dIdx) => (<td key={dIdx}><input className="cell-input-subject" value={s.periods[pIdx]?.sub || ""} onChange={e => handleSubjectChange(dIdx, pIdx, e.target.value)} /><textarea className="cell-input-unit" value={s.periods[pIdx]?.unit || ""} onChange={e => handleUnitChange(dIdx, pIdx, e.target.value)} rows={2} /></td>))}</tr>))}
                <tr className="row-dismissal"><td>下校</td>{newsData.schedule.slice(0, 5).map((s, dIdx) => (<td key={dIdx}><input className="cell-input-subject" value={s.dismissal} onChange={e => { const newSched = [...newsData.schedule]; newSched[dIdx].dismissal = e.target.value; setNewsData({ ...newsData, schedule: newSched }); }} /></td>))}</tr>
              </tbody>
            </table>
            <div className="announcement-wide" style={{ fontSize: `${contentScale}rem` }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1em', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={22} /> お知らせ</h4>
              <textarea className="announcement-textarea" value={newsData.wideNotes} onChange={e => setNewsData({ ...newsData, wideNotes: e.target.value })} rows={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
