console.log("[Coursera Exporter] content.js loaded");

function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.-]/g, "_");
}

function cleanText(text) {
  return text
    .replace(/\s+/g, " ") // collapse multiple spaces
    .replace(/\s*([,;:.!?])\s*/g, "$1 ") // remove spaces before/after punctuation, add single space after
    .replace(/\s*([()\[\]{}])\s*/g, "$1") // remove spaces around brackets/parentheses
    .replace(/\s*-\s*/g, " - ") // normalize dashes with spaces
    .replace(/\s*\n\s*/g, "\n") // remove spaces around newlines
    .replace(/\n{2,}/g, "\n") // collapse multiple newlines
    .replace(/[“”]/g, '"') // normalize curly quotes
    .replace(/[‘’]/g, "'") // normalize single curly quotes
    .replace(/([,;:.!?]){2,}/g, "$1") // collapse repeated punctuation
    .replace(/^\s+|\s+$/g, "") // trim leading/trailing whitespace
    .replace(/^[,;:.!?]+|[,;:.!?]+$/g, "") // trim leading/trailing punctuation
    .replace(/\s{2,}/g, " ") // collapse any remaining double spaces
    .trim();
}

function getCleanText(el) {
  return el.textContent.replace(/\s+/g, " ").trim();
}

function extractStructuredText(el) {
  let result = "";

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (isInVirtuallyHidden(node)) return;
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

  function isInVirtuallyHidden(node) {
    while (node && node !== el) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName === "SPAN" &&
        node.getAttribute("data-testid")?.trim() === "virtually-hidden"
      ) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  walk(el);
  return result.replace(/\s+/g, " ").trim();
}

function katexToText(katexHtml) {
  let text = "";
  const spans = katexHtml.querySelectorAll("span");

  spans.forEach((span) => {
    let ariaLabel = span.getAttribute("aria-label");
    const style = getComputedStyle(span);
    if (ariaLabel && style?.display !== "none") {
      // Simplify aria-label descriptions to more readable math
      ariaLabel = ariaLabel
        .replace(/start superscript/g, "^(")
        .replace(/end superscript/g, ")")
        .replace(/start subscript/g, "_(")
        .replace(/end subscript/g, ")")
        .replace(/with, hat, on top/g, "^hat")
        .replace(/left parenthesis/g, "(")
        .replace(/right parenthesis/g, ")")
        .replace(/vertical bar/g, "|")
        .replace(/comma/g, ",")
        .replace(/plus/g, "+")
        .replace(/equals/g, "=")
        .replace(/sigma/g, "σ")
        .replace(/in/g, "∈")
        .replace(/ /g, "")
        .replace(/,+/g, ",")
        .replace(/,\)/g, ")");
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
    console.log(
      "[Coursera Exporter] <span> with 'Next item' not found yet. Retrying in 2s..."
    );
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
    let question = extractStructuredText(group);
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

    question = cleanText(question);
    answer = cleanText(answer);

    rows.push([question, answer, images.join("; ")]);
  });

  const pathParts = window.location.pathname.split("/");
  const courseName = pathParts.includes("learn") ? pathParts[pathParts.indexOf("learn") + 1] : "unknown_course";
  const quizName = pathParts.includes("assignment-submission") ? pathParts[pathParts.indexOf("assignment-submission") + 1] : "unknown_quiz";

  const filename = `coursera_quiz_${courseName}_${quizName}_${getCurrentTimestamp()}.csv`;
  console.log(`[Coursera Exporter] Extracted ${rows.length - 1} question(s). Downloading as ${filename}`);
  downloadCSV(filename, rows);
}



function downloadCSV(filename, rows) {
  const csvContent = rows
    .map((r) =>
      r
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

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

