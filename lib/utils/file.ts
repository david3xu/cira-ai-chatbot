export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

export const isMarkdownFile = (file: File): boolean => {
  return file.type === 'text/markdown' || file.name.toLowerCase().endsWith('.md');
}; 