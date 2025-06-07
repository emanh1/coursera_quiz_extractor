console.log("[Coursera Exporter] content.js loaded");

function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.-]/g, "_");
}

function getCleanText(el) {
  return el.textContent.replace(/\s+/g, " ").trim();
}

function extractStructuredText(el) {
  let result = "";

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.nodeValue;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList.contains("katex")) {
        const html = node.querySelector(".katex-html");
        if (html) {
          result += katexToText(html);
        }
        return;
      }

      if (node.tagName === "SUP") {
        result += "^(";
        walkChildren(node);
        result += ")";
      } else if (node.tagName === "SUB") {
        result += "_(";
        walkChildren(node);
        result += ")";
      } else {
        walkChildren(node);
      }
    }
  }

  function walkChildren(parent) {
    for (let child of parent.childNodes) {
      walk(child);
    }
  }

  walk(el);
  return result.replace(/\s+/g, " ").trim();
}

function katexToText(katexHtml) {
  let text = "";
  const spans = katexHtml.querySelectorAll("span");

  spans.forEach(span => {
    const ariaLabel = span.getAttribute("aria-label");
    const style = getComputedStyle(span);
    if (ariaLabel && style?.display !== "none") {
      text += ariaLabel;
    } else if (span.textContent && style?.display !== "none") {
      text += span.textContent;
    }
  });

  return text;
}

function waitForNextItemAndAddButton() {
  const nextItemLabel = document.evaluate(
    "//span[contains(text(), 'Next item')]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (!nextItemLabel) {
    console.log("[Coursera Exporter] <span> with 'Next item' not found yet. Retrying in 2s...");
    setTimeout(waitForNextItemAndAddButton, 2000);
    return;
  }

  console.log("[Coursera Exporter] <span> with 'Next item' found. Proceeding to add export button.");
  addExportButton();
}

function addExportButton() {
  if (document.querySelector("#coursera-export-button")) {
    console.log("[Coursera Exporter] Button already exists, skipping.");
    return;
  }

  const button = document.createElement("button");
  button.innerText = "Export Q&A";
  button.id = "coursera-export-button";
  button.style = `
    margin: 10px; padding: 10px 16px; font-size: 14px;
    background-color: #0056d2; color: white; border: none;
    border-radius: 4px; cursor: pointer; z-index: 9999;
    position: fixed; top: 20px; right: 20px;
  `;

  button.onclick = extractAndDownload;
  document.body.appendChild(button);

  console.log("[Coursera Exporter] Export button added to page.");
}

function extractAndDownload() {
  console.log("[Coursera Exporter] Starting extraction...");

  const rows = [["Question", "Answer", "Images"]];
  const questionGroups = document.querySelectorAll('div[role="group"]');

  questionGroups.forEach((group, idx) => {
    const question = extractStructuredText(group);
    let answer = "Not found";
    const images = [];

    try {
      const corrects = group.querySelectorAll("label.cui-isChecked");
      if (corrects.length > 0) {
        answer = Array.from(corrects)
          .map((el) => extractStructuredText(el))
          .join("; ");
      }
    } catch (e) {
      console.warn(`[Coursera Exporter] Error extracting answer for question ${idx}:`, e);
    }

    const imgTags = group.querySelectorAll("img");
    imgTags.forEach((img) => {
      const src = img.src;
      images.push(src);
    });

    rows.push([question, answer, images.join("; ")]);
  });

  const filename = `coursera_quiz_export_${getCurrentTimestamp()}.csv`;
  console.log(`[Coursera Exporter] Extracted ${rows.length - 1} question(s). Downloading as ${filename}`);
  downloadCSV(filename, rows);
}

function downloadCSV(filename, rows) {
  const csvContent = rows.map(r =>
    r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("[Coursera Exporter] Download initiated.");
}

setTimeout(waitForNextItemAndAddButton, 1000);

