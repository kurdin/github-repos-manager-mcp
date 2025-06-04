function toMarkdownTable(items, columns) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }
  const headers = columns.map(col => col.header);
  const headerLine = `| ${headers.join(' | ')} |`;
  const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const rows = items.map(item => {
    const cells = columns.map(col => {
      const value = typeof col.accessor === 'function'
        ? col.accessor(item)
        : item[col.accessor];
      return String(value ?? '');
    });
    return `| ${cells.join(' | ')} |`;
  });
  return [headerLine, separatorLine, ...rows].join('\n');
}
module.exports = { toMarkdownTable };
