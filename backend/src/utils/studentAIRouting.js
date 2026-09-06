// Classifies the student's question into one of:
//   MY_STUDENT_DATA, LEARNSPACE_KNOWLEDGE, GENERAL_KNOWLEDGE,
//   OTHER_STUDENT_DATA, INTERNAL_SYSTEM_REQUEST, CASUAL.
// Regex is early detection only; real protection is DB-level scoping.

// intent constants

export const INTENT = Object.freeze({
  MY_STUDENT_DATA: "MY_STUDENT_DATA",
  LEARNSPACE_KNOWLEDGE: "LEARNSPACE_KNOWLEDGE",
  GENERAL_KNOWLEDGE: "GENERAL_KNOWLEDGE",
  OTHER_STUDENT_DATA: "OTHER_STUDENT_DATA",
  INTERNAL_SYSTEM_REQUEST: "INTERNAL_SYSTEM_REQUEST",
  CASUAL: "CASUAL",
});

// other-student data detection (early detection; not a security gate)

const OTHER_STUDENT_PATTERNS = [
  // Named other students
  /\b(rahul|ankit|priya|anish|rishabh|raj|sneha|amit|suresh|vijay)\b.*\b(progress|course|quiz|cert|mark|score|grade|data|detail|profile)\b/i,
  /\b(progress|course|quiz|cert|mark|score|grade|data|detail|profile)\b.*\b(rahul|ankit|priya|anish|rishabh|raj|sneha|amit|suresh|vijay)\b/i,

  // "another student", "other student", "someone else"
  /\b(another|other|kisi\s+aur|dusre|any\s+other|someone\s+else)\s+(student|user|learner|participant)/i,

  // "show me student ID 123" / "get student <id>"
  /\b(show|get|fetch|find|search|lookup|give|tell|batao|dikhao|nikalo)\b.*\b(student\s*(id)?|user\s*(id)?|learner)\s*\d/i,
  /\b(student|user|learner)\s*(id|ID)?\s*\d{4,}/,

  // Email-based lookup attempts
  /\b(search|find|get|show|lookup)\b.*\b(student|user)\b.*\bemail\b/i,
  /\bstudent\b.*\bemail\b.*\b(@|gmail|yahoo|hotmail|outlook)\b/i,

  // Username-based lookup attempts
  /\b(search|find|get|show|lookup)\b.*\b(student|user)\b.*\busername\b/i,

  // Direct ID references for other students
  /\b(student|user)\s*(id)?\s*:?\s*[a-f0-9]{24}/i,

  // "whose course is this"
  /\bwhose\b.*\b(course|progress|cert|quiz|data)\b/i,

  // "list all students" / "all students data"
  /\b(all|saare|sab)\s+(students?|users?|learners?)\b/i,
  /\b(students?|users?|learners?).*\b(list|show|fetch|get|data|all)\b/i,

  // Hindi patterns for asking about others
  /\b(us\s+ka|uski|uske|unka|unki|unke|uska|usk[ai])\b.*\b(progress|course|quiz|cert|mark|data)/i,
  /\b(progress|course|quiz|cert|mark|data).*\b(us\s+ka|uski|uske|unka|unki|unke|uska|usk[ai])\b/i,
];

/**
 * Check if the question appears to be requesting another student's private data.
 * NOTE: This is an early detection mechanism only. The real protection is that
 * every database query is scoped to the authenticated student's ID.
 */
export function looksLikeOtherStudentData(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.trim();

  for (const pattern of OTHER_STUDENT_PATTERNS) {
    if (pattern.test(t)) return true;
  }

  return false;
}

// internal system request detection

const INTERNAL_PROBE_PATTERNS = [
  /\b(file\s*path|folder\s*structure|source\s*code|private\s*code|private\s*file|\.env|environment\s*variable|api\s*key|secret|password|token)\b/i,
  /\b(database\s*(?:password|credential|uri|name|host)|mongodb\s*(?:password|credential|uri))\b/i,
  /\b(system\s*prompt|hidden\s*prompt|prompt\s*injection|ignore\s*(?:previous|all)\s*instructions)\b/i,
  /\b(embedding\s*vector|vector\s*index|rag\s*implementation|knowledge\s*chunk|vector\s*search)\b/i,
  /\b(backend\s*code|frontend\s*code|controller|route\s*implementation|middleware)\b/i,
  /\b(show|give|reveal|expose|display)\b.*\b(code|implementation|source|internal|architecture|schema|model)\b/i,
  /\b(axios|redux|jwt|bearer|cookie)\b.*\b(implement|code|secret|key|token|config)\b/i,
  /\b(i\s*am\s*(admin|super\s*admin|root|system))\b/i,
  /\b(pretend|imagine|assume)\b.*\b(you\s*are|i\s*am)\b.*\b(admin|another|different|other)/i,
];

/**
 * Check if the question appears to be probing internal system details.
 */
export function looksLikeInternalProbe(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.trim();

  for (const pattern of INTERNAL_PROBE_PATTERNS) {
    if (pattern.test(t)) return true;
  }

  return false;
}

// casual / greeting detection

const CASUAL_PATTERN =
  /^(hi+|hii+|hell+o+|heyo|hey|yo|namaste|namaskar|hola|howdy|sup|wassup|o?k+aya?)\b|^(kaise ho|kya haal|kese ho|aap kaise|how are you|how r u|hru|good morning|good afternoon|good evening|good night|gm|gn)\b|^(thank|thanks|thnx|thank you|dhanyavad|shukriya|bye|goodbye|ok|okay|great|nice|hello friend)\b/i;

export function isCasualMessage(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.trim().toLowerCase();
  if (t.length > 60) return false;
  if (CASUAL_PATTERN.test(t)) return true;
  const words = t.split(/\s+/).filter(Boolean);
  return words.length <= 3 && !t.includes("?");
}

// my-student-data detection (student asking about their own data)

const MY_DATA_PATTERN =
  /(\bmy\b|\bmera\b|\bmeri\b|\bmere\b|\bapna\b|\bapni\b|\baapka\b|\bhumein\b|\bmain\b|\bki?tne\b|\bkitna\b).*\b(courses?|progress|lessons?|certificates?|capstones?|quizzes?|enrollment|enrolled|dashboard|count|data|profile|skill|reputation|quiz\s*result|assessment|mark|score|grade)\b|\b(courses?|progress|lessons?|certificates?|capstones?|quizzes?|profile|skill|reputation)\b.*\b(mera|meri|mere|mujhe maine|kitne|kitna|count|total|my)\b/i;

/**
 * Check if the question is about the student's OWN LearnSpace data.
 */
export function looksLikeMyData(text) {
  if (!text || typeof text !== "string") return false;
  return MY_DATA_PATTERN.test(text.trim());
}

// learnspace knowledge detection

const LEARNSPACE_KEYWORDS =
  /\b(learnspace|how\s*(do|does|can|to)|enroll|enrolment|enrolled|certificate\s*(flow|process|how|where)|capstone\s*(flow|process|how)|lesson\s*(unlock|flow|how)|quiz\s*(flow|process|how)|progress\s*(track|flow|how)|dashboard\s*(work|feature)|student\s*(panel|dashboard|feature)|admin\s*(panel|dashboard|feature)|platform\s*(feature|work|flow)|account\s*(work|flow)|login\s*(flow|work|how)|register|signup|sign\s*up|sign\s*in|log\s*in|password\s*(reset|recover|forgot)|badge|reputation|leaderboard)\b/i;

export function wantsLearnSpaceKnowledge(text) {
  if (!text || typeof text !== "string") return false;
  return LEARNSPACE_KEYWORDS.test(text.trim());
}

// internal request refusal string

export const INTERNAL_REFUSAL =
  "Sorry, I can't provide internal system details, source code, API endpoints, database information, or implementation details. I can help you learn concepts and answer educational questions instead.";

// other-student refusal string

export const OTHER_STUDENT_REFUSAL =
  "Sorry, I can't provide another student's private or academic information. I can only help with your own LearnSpace data.";

// prompt injection refusal string

export const PROMPT_INJECTION_REFUSAL =
  "I can't follow instructions to change my behavior or pretend to be someone else. I'm here to help you with your own LearnSpace learning data and educational questions.";

// main classification function (order of checks matters)

export function classifyStudentIntent(text) {
  if (!text || typeof text !== "string") return INTENT.GENERAL_KNOWLEDGE;

  const trimmed = text.trim();

  // 1. Internal/system request — refuse immediately (highest priority)
  if (looksLikeInternalProbe(trimmed)) {
    return INTENT.INTERNAL_SYSTEM_REQUEST;
  }

  // 2. Prompt injection / impersonation attempts
  if (isPromptInjectionAttempt(trimmed)) {
    return INTENT.INTERNAL_SYSTEM_REQUEST;
  }

  // 3. Other-student data — refuse before any DB queries
  if (looksLikeOtherStudentData(trimmed)) {
    return INTENT.OTHER_STUDENT_DATA;
  }

  // 4. Casual / greeting
  if (isCasualMessage(trimmed)) {
    return INTENT.CASUAL;
  }

  // 5. My own student data
  if (looksLikeMyData(trimmed)) {
    return INTENT.MY_STUDENT_DATA;
  }

  // 6. LearnSpace knowledge (RAG)
  if (wantsLearnSpaceKnowledge(trimmed)) {
    return INTENT.LEARNSPACE_KNOWLEDGE;
  }

  // 7. Default: general educational / external knowledge
  return INTENT.GENERAL_KNOWLEDGE;
}

// prompt injection / impersonation detection

const INJECTION_PATTERNS = [
  /\bignore\s*(previous|all|above|prior)\s*(instructions?|rules?|prompts?|guidelines?|context)/i,
  /\byou\s*are\s*(now|actually|really)\s*(an?\s+)?(admin|super|root|system|another|different)/i,
  /\bpretend\s*(you|i|we)\s*(are|is|am|have)\b/i,
  /\bdisregard\s*(previous|all|above|prior)\b/i,
  /\bforgot\s*(previous|all|above|prior)\b/i,
  /\bnew\s*instructions?\s*:/i,
  /\boverride\s*(previous|all|above|prior)\b/i,
  /\bact\s*as\s*(if|though)\b.*\b(i\s*am|you\s*are|we\s*are)\b/i,
  /\bdeveloper\s*mode\s*(on|enabled|activate)/i,
  /\bjailbreak/i,
  /\bDAN\s+mode/i,
  /\b(use|set|change)\s*student\s*(id|ID|user)\s*(to|as|=|:)\s*\w+/i,
  /\buse\s*studentId\s*\d+/i,
  /\bswitch\s*(to|to\s*the)\s*(student|user|account)/i,
];

function isPromptInjectionAttempt(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.trim();

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(t)) return true;
  }

  return false;
}
