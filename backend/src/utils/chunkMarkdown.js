import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "ai-knowledge", "learnspace.md");

const MAX_CHARS = 2500;

export function loadMarkdown() {
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Semantic chunking for the LearnSpace knowledge base.
 *
 * Strategy:
 *   - Split the markdown into logical sections by top-level (H1/H2) headings.
 *   - Within a section, walk through paragraphs in order.
 *   - Keep a running chunk and append paragraphs until it reaches a
 *     comfortable target size. Break ONLY at paragraph (blank-line)
 *     boundaries so sentences and single concepts are never split.
 *   - Every chunk is prefixed with its section heading so it stands alone.
 *   - H3/H4 subheadings are preserved inline within their section's flow so
 *     context is never lost.
 *   - If a single paragraph alone is very large, it is split only at
 *     sentence boundaries.
 *
 * Returns an array of chunks: { heading, section, content }.
 */
export function chunkMarkdown(markdown) {
  if (!markdown || typeof markdown !== "string") {
    return [];
  }

  // Split into top-level sections on any H1/H2 heading line.
  const sections = markdown.split(/\n(?=#{1,2}\s+)/);

  const chunks = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^(#{1,2})\s+(.+)$/m);
    if (!headingMatch) {
      // Any leading text before the first heading becomes its own chunk.
      chunks.push({
        heading: "# LearnSpace",
        section: "LearnSpace",
        content: trimmed,
      });
      continue;
    }

    const heading = `${headingMatch[1]} ${headingMatch[2].trim()}`;
    const sectionName = headingMatch[2].trim();

    // Everything after the heading line (including H3/H4 subheadings).
    const body = trimmed
      .split(/\r?\n/)
      .slice(1)
      .join("\n")
      .trim();

    if (!body) {
      chunks.push(
        buildChunk(heading, sectionName, "This section provides the following topic overview."),
      );
      continue;
    }

    // Split body into paragraphs on blank lines. H3/H4 headings remain part
    // of the paragraph flow (they are separated by blank lines).
    const paragraphs = splitParagraphs(body);

    let buffer = "";

    const flush = () => {
      if (buffer) {
        chunks.push(buildChunk(heading, sectionName, buffer));
        buffer = "";
      }
    };

    for (const paragraph of paragraphs) {
      const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;

      if (paragraph.length > MAX_CHARS) {
        // Very long single paragraph: flush current buffer, then split this
        // paragraph only at sentence boundaries.
        flush();
        for (const part of splitBySentences(paragraph)) {
          chunks.push(buildChunk(heading, sectionName, part));
        }
        continue;
      }

      if (candidate.length > MAX_CHARS && buffer) {
        flush();
        buffer = paragraph;
      } else {
        buffer = candidate;
      }
    }

    flush();
  }

  return chunks;
}

function buildChunk(heading, sectionName, body) {
  return {
    heading,
    // Clean section name without the '#' markers (used as retrieval context).
    section: sectionName || "General",
    // Self-contained chunk: section heading + body, so it reads alone.
    content: `${sectionName}\n\n${body.trim()}`,
  };
}

function splitParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitBySentences(text) {
  const sentences =
    text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)?.map((s) => s.trim()) ||
    [text];

  const groups = [];
  let group = "";

  for (const sentence of sentences.filter(Boolean)) {
    const candidate = group ? `${group} ${sentence}` : sentence;
    if (candidate.length > MAX_CHARS + 400 && group) {
      groups.push(group);
      group = sentence;
    } else {
      group = candidate;
    }
  }

  if (group) groups.push(group);
  return groups;
}

export { MAX_CHARS };
