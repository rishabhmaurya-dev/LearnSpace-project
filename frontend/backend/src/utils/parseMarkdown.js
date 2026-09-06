
const normalizeContent = (content) => {
  if (!content) return "";

  return content
    // Windows newline -> Unix newline
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // If literal "\n" is stored in DB, convert it to actual newline
    .replace(/\\n/g, "\n")
    .trim();
};

const extractSection = (markdown, heading) => {
  const regex = new RegExp(
    `##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`,
    "i",
  );

  const match = markdown.match(regex);

  return match ? normalizeContent(match[1]) : "";
};

const extractCodeExample = (content) => {
  const match = content.match(
    /```(?:javascript|js|jsx|typescript|ts|html|css)?\s*([\s\S]*?)```/i,
  );

  return match ? normalizeContent(match[1]) : "";
};

/**
 * Extract a clean URL from a section's raw content.
 *
 * Supports:
 *   - Plain URL
 *   - Markdown link
 *   - Angle-bracket URL
 */
const extractUrl = (content) => {
  if (!content || !content.trim()) return "";

  const trimmed = normalizeContent(content);

  // 1. Markdown link:
  // [text](url)
  // [text](<url>)
  const markdownLink = trimmed.match(
    /!?\[[^\]]*\]\(<?([^)>]+)>?\)/,
  );

  if (markdownLink && markdownLink[1]) {
    return markdownLink[1].trim();
  }

  // 2. Angle-bracket URL:
  // <https://youtube.com/...>
  const angleLink = trimmed.match(/<([^>]+)>/);

  if (angleLink && angleLink[1]) {
    return angleLink[1].trim();
  }

  // 3. Bare URL
  const bareUrl = trimmed.match(
    /https?:\/\/[^\s<>"']+/,
  );

  if (bareUrl) {
    return bareUrl[0]
      .replace(/[),.;]+$/, "")
      .trim();
  }

  // 4. Fallback:
  // If content contains only one word/token,
  // treat it as URL
  if (!/\s/.test(trimmed)) {
    return trimmed;
  }

  return "";
};

export const parseLessonMarkdown = (markdown) => {
  if (!markdown || !markdown.trim()) {
    throw new Error("Markdown file is empty");
  }

  // Normalize complete markdown first
  const normalizedMarkdown = markdown
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const titleMatch = normalizedMarkdown.match(/^#\s+(.+)$/m);

  if (!titleMatch) {
    throw new Error(
      "Markdown must contain a main title using '# Title'",
    );
  }

  const title = titleMatch[1].trim();

  const topicHeading =
    extractSection(normalizedMarkdown, "Topic") || title;

  const definition = extractSection(
    normalizedMarkdown,
    "Definition",
  );

  const detailedMeaning = extractSection(
    normalizedMarkdown,
    "Detailed Meaning",
  );

  const example = extractSection(
    normalizedMarkdown,
    "Example",
  );

  const codeSection = extractSection(
    normalizedMarkdown,
    "Code Example",
  );

  const codeExampleExplanation = extractSection(
    normalizedMarkdown,
    "Code Explanation",
  );

  const videoSection = extractSection(
    normalizedMarkdown,
    "Video",
  );

  const notesSection = extractSection(
    normalizedMarkdown,
    "Notes",
  );

  if (!definition) {
    throw new Error(
      `Definition section missing in lesson '${title}'`,
    );
  }

  if (!detailedMeaning) {
    throw new Error(
      `Detailed Meaning section missing in lesson '${title}'`,
    );
  }

  if (!example) {
    throw new Error(
      `Example section missing in lesson '${title}'`,
    );
  }

  return {
    title: normalizeContent(title),
    topicHeading: normalizeContent(topicHeading),

    definition: normalizeContent(definition),

    detailedMeaning: normalizeContent(detailedMeaning),

    example: normalizeContent(example),

    codeExample: extractCodeExample(codeSection),

    codeExampleExplanation: normalizeContent(
      codeExampleExplanation,
    ),

    videoUrl: extractUrl(videoSection),

    notesPdfUrl: extractUrl(notesSection),

    // Original markdown
    markdownSource: normalizedMarkdown,
  };
};
