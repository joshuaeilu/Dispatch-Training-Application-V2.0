function formatFileSize(bytes: number | string): string {
    const n = typeof bytes === 'string' ? Number(bytes) : bytes;
    if (!Number.isFinite(n) || n <= 0) return '0 MB';
    const mb = n / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
}

function formatDateOnly(dateInput: string | Date): string {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return String(dateInput);
    // Local YYYY-MM-DD without time
    return d.toLocaleDateString('en-CA');
}



 function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const singularize = (word: string) => {
  if (!word) return "";
  // basic plural removal
  if (word.endsWith("ies")) return word.slice(0, -3) + "y"; // e.g. "bodies" → "body"
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1); // e.g. "videos" → "video"
  return word; // unchanged if already singular
};

function matchCase(orig: string, out: string) {
  if (!orig) return out;
  return orig[0] === orig[0].toUpperCase()
    ? out.charAt(0).toUpperCase() + out.slice(1)
    : out;
}


function addS(word: string): string {
  return word + 's';
}
function removeS(word: string): string {
  if (word.endsWith('s')) {
    return word.slice(0, -1);
  }
  return word;
}


export { formatFileSize, formatDateOnly, toTitleCase, singularize,  addS, removeS, matchCase };