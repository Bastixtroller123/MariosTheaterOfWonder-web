const FOLDER_ID = "1KSxM6bFrXewx1R4Duh200plfcJqX_D3j";

const JOKE_RE = /[\s|\-–—,:]*\bjoke\b[\s|\-–—,:]*/i;

function setup() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("buildLogs").timeBased().everyMinutes(10).create();
  buildLogs();
}


function doGet(e) {
  const debug = e && e.parameter && e.parameter.debug;
  const out = debug ? buildLogs(true) : buildLogs();
  return ContentService.createTextOutput(JSON.stringify(out, null, debug ? 2 : 0))
  .setMimeType(ContentService.MimeType.JSON);
}

function clean(s) {
  return String(s || "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").trim();
}

function buildLogs(debug) {
  const props = PropertiesService.getScriptProperties();
  const logs = [];
  const report = [];
  const files = DriveApp.getFolderById(FOLDER_ID).getFilesByType(MimeType.GOOGLE_DOCS);

  while (files.hasNext()) {
    const f = files.next();
    const author = f.getName();
    const doc = DocumentApp.openById(f.getId());
    const tabs = flattenTabs(doc.getTabs());

    tabs.forEach((tab, idx) => {
      const blocks = bodyToBlocks(tab.asDocumentTab().getBody());
      const title = tab.getTitle();

      const headRaw = blocks.filter(b => b.type === "text").slice(0, 3).map(b => b.value);

      let date = null;
      let joke = JOKE_RE.test(title);
      blocks.filter(b => b.type === "text").slice(0, 3).forEach(b => {
        let t = b.value;
        const isHeader = /^date:/i.test(t) || t.length <= 40;
        if (isHeader && JOKE_RE.test(t)) {
          joke = true;
          t = clean(t.replace(JOKE_RE, " "));
        }
        if (!date) {
          const d = parseManualDate(t);
          if (d) { date = d; t = ""; }
        }
        if (t) b.value = t;
        else blocks.splice(blocks.indexOf(b), 1);
      });

        if (debug) {
          report.push({ author, title, joke, date: date ? date.toISOString() : null, headRaw, blocks: blocks.length });
        }
        if (!blocks.length) return;

        if (!date) {
          const key = "seen:" + f.getId() + ":" + tab.getId();
          let seen = props.getProperty(key);
          if (!seen) { seen = new Date().toISOString(); props.setProperty(key, seen); }
          date = new Date(seen);
        }
        logs.push({ title, author, date: date.toISOString(), order: idx, category: joke ? "joke" : "devlog", blocks });
    });
  }
  logs.sort((a, b) => new Date(a.date) - new Date(b.date) || a.order - b.order);
  return debug ? report : logs;
}

function flattenTabs(tabs) {
  let out = [];
  tabs.forEach(t => { out.push(t); out = out.concat(flattenTabs(t.getChildTabs())); });
  return out;
}

function parseManualDate(s) {
  const m0 = clean(s).match(/^date:\s*(.+)$/i);
  if (!m0) return null;
  const txt = m0[1].trim();
  const m = txt.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})(?:[ ,]+(\d{1,2}):(\d{2}))?$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0));
  const d = new Date(txt);
  return isNaN(d) ? null : d;
}

function bodyToBlocks(body) {
  const blocks = [];
  const T = DocumentApp.ElementType;
  for (let i = 0; i < body.getNumChildren(); i++) {
    const el = body.getChild(i);
    const type = el.getType();
    if (type !== T.PARAGRAPH && type !== T.LIST_ITEM) continue;
    const p = type === T.PARAGRAPH ? el.asParagraph() : el.asListItem();

    const text = clean(p.getText());
    if (text) {
      if (/youtu\.?be/.test(text)) blocks.push({ type: "youtube", url: text });
      else blocks.push({ type: "text", value: text });
    }
    for (let j = 0; j < p.getNumChildren(); j++) {
      const c = p.getChild(j);
      if (c.getType() === T.INLINE_IMAGE) {
        const blob = c.asInlineImage().getBlob();
        blocks.push({
          type: "image",
          src: "data:" + blob.getContentType() + ";base64," + Utilities.base64Encode(blob.getBytes())
        });
      }
    }
  }
  return blocks;
}
