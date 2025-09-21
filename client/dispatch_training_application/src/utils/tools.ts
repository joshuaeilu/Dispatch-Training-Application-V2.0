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


export { formatFileSize, formatDateOnly, toTitleCase };