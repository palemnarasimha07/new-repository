// Document parsing and AI study material topic analysis engine
// Supports PDF (via pdfjs-dist or ArrayBuffer text decoder fallback) and TXT files

import * as pdfjsLib from "pdfjs-dist";

// Set worker path dynamically for pdfjs-dist
if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.10.38"}/pdf.worker.min.mjs`;
}

// Core NCC Curriculum Topics & Keyword Mapping
const NCC_TOPIC_KNOWLEDGE_BASE = [
  { topic: "NCC Fundamentals & History", keywords: ["ncc", "motto", "unity", "discipline", "flag", "aims", "directorate", "cardinal", "history", "pledge", "ranks", "insignia"] },
  { topic: "Drill & Discipline", keywords: ["drill", "savdhan", "vishram", "parade", "salute", "march", "squad", "turn", "kadam", "sahat", "command", "halt"] },
  { topic: "Weapon Training & Marksmanship", keywords: ["weapon", "rifle", ".22", "insas", "firing", "range", "aiming", "trigger", "stripper", "magazines", "barrel", "safety", "sight", "grouping"] },
  { topic: "First Aid & Health Hygiene", keywords: ["first aid", "bandage", "fracture", "cpr", "bleeding", "wound", "hygiene", "sanitation", "resuscitation", "tourniquet", "burns", "shock", "poisoning"] },
  { topic: "Leadership & Personality Development", keywords: ["leadership", "discipline", "courage", "character", "duty", "teamwork", "motivation", "integrity", "morale", "subordinate", "decision", "initiative"] },
  { topic: "Disaster Management & Civil Defence", keywords: ["disaster", "flood", "earthquake", "fire", "evacuation", "rescue", "relief", "civil defence", "first responder", "tsunami", "cyclone", "emergency"] },
  { topic: "Map Reading & Fieldcraft", keywords: ["map", "compass", "bearing", "contour", "grid", "scale", "conventional signs", "north", "grid reference", "ground", "gradient", "section formation", "camouflage", "concealment"] },
  { topic: "Communication & Radio Protocols", keywords: ["communication", "radio", "signal", "callsign", "walkie talkie", "net", "frequency", "transmission", "cipher", "message", "sender", "receiver"] },
  { topic: "Camps & Adventure Training", keywords: ["catc", "rdc", "blc", "tsc", "nic", "trekking", "parasailing", "mountaineering", "obstacle", "camp", "tent", "bivouac", "firing range"] },
  { topic: "General Knowledge & National Integration", keywords: ["india", "constitution", "patriotism", "republic", "armed forces", "army", "navy", "air force", "heritage", "culture", "national integration"] }
];

/**
 * Extract raw text content from uploaded File (PDF or TXT)
 */
export async function extractTextFromFile(file) {
  if (!file) throw new Error("No file provided.");

  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || "");
      reader.onerror = () => reject(new Error("Failed to read text file."));
      reader.readAsText(file);
    });
  }

  if (name.endsWith(".pdf")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += `\n--- Page ${i} ---\n` + pageText;
      }

      if (fullText.trim().length > 0) return fullText;
    } catch (err) {
      console.warn("PDF.js parsing error, attempting raw text decoding fallback:", err);
    }

    // Fallback ArrayBuffer text decoder if pdfjs worker fails
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result || "";
        // Strip non-printable ASCII
        const cleaned = text.replace(/[^\x20-\x7E\n\r]/g, " ");
        resolve(cleaned);
      };
      reader.onerror = () => reject(new Error("Failed to read PDF file."));
      reader.readAsText(file);
    });
  }

  // Fallback for doc / docx / other text files
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || "");
    reader.onerror = () => reject(new Error("Unsupported or corrupted document format."));
    reader.readAsText(file);
  });
}

/**
 * Analyze study material content, detect topics, importance, coverage %, and question counts
 */
export function analyzeStudyMaterial(text, fileName, fileSizeBytes) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const lowerText = cleanText.toLowerCase();
  const totalLength = lowerText.length;

  // 1. Detect Heading & Section Candidates
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const detectedHeadings = rawLines.filter(
    (l) =>
      /^(chapter|section|unit|module|topic|\d+\.\d+)\b/i.test(l) ||
      (l.length > 5 && l.length < 60 && l === l.toUpperCase() && !/^[0-9]+$/.test(l))
  );

  // 2. Keyword & Topic Frequency Analysis
  const detectedTopics = [];

  NCC_TOPIC_KNOWLEDGE_BASE.forEach((item) => {
    let matchCount = 0;
    const matchedKeywords = [];

    item.keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        matchCount += matches.length;
        matchedKeywords.push(kw);
      }
    });

    if (matchCount > 0) {
      // Calculate topic coverage relative to total document weight
      const coveragePct = Math.min(98, Math.max(8, Math.round((matchCount * 12) / Math.max(1, Math.sqrt(totalLength / 100)))));

      // Determine Importance
      let importance = "Low";
      if (matchCount >= 8 || coveragePct >= 35) importance = "High";
      else if (matchCount >= 3 || coveragePct >= 15) importance = "Medium";

      // Calculate suggested question count
      const qCount = importance === "High" ? 6 : importance === "Medium" ? 4 : 2;

      detectedTopics.push({
        id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        topic: item.topic,
        occurrences: matchCount,
        coveragePct,
        importance,
        selected: true,
        available: Math.max(matchCount * 2, 6),
        qCount,
        matchedKeywords: matchedKeywords.slice(0, 5),
      });
    }
  });

  // If no predefined topic matches, generate fallback topics from detected headings or generic structure
  if (detectedTopics.length === 0) {
    const headingsToUse = detectedHeadings.length > 0
      ? detectedHeadings.slice(0, 5)
      : ["NCC General Principles", "Drill & Parade Protocols", "Leadership & Ethics", "First Aid Basics"];

    headingsToUse.forEach((hd, idx) => {
      detectedTopics.push({
        id: `topic_${Date.now()}_${idx}`,
        topic: hd.replace(/^[-*#\d.]+\s*/, "").slice(0, 40),
        occurrences: 3,
        coveragePct: Math.round(100 / headingsToUse.length),
        importance: idx === 0 ? "High" : "Medium",
        selected: true,
        available: 6,
        qCount: 5,
        matchedKeywords: ["general", "training"],
      });
    });
  }

  // Sort by Importance (High -> Medium -> Low) & Occurrences
  const importanceWeight = { High: 3, Medium: 2, Low: 1 };
  detectedTopics.sort((a, b) => {
    if (importanceWeight[b.importance] !== importanceWeight[a.importance]) {
      return importanceWeight[b.importance] - importanceWeight[a.importance];
    }
    return b.occurrences - a.occurrences;
  });

  const formattedSize = fileSizeBytes
    ? `${(fileSizeBytes / 1024).toFixed(1)} KB`
    : `${Math.max(12, Math.round(text.length / 1024))} KB`;

  return {
    id: `mat_${Date.now()}`,
    fileName: fileName || "NCC Study Document.pdf",
    uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    fileSize: formattedSize,
    totalTextLength: cleanText.length,
    detectedHeadings: detectedHeadings.slice(0, 10),
    topics: detectedTopics,
  };
}
