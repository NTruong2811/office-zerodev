import * as Diff from 'diff';
import type { DiffItem } from '../types/office';

export function compareWordDocs(
  htmlA: string,
  htmlB: string
): { diffHtml: string; diffList: DiffItem[] } {
  const parser = new DOMParser();
  const docA = parser.parseFromString(htmlA, 'text/html');
  const docB = parser.parseFromString(htmlB, 'text/html');

  const textA = docA.body.innerText || docA.body.textContent || '';
  const textB = docB.body.innerText || docB.body.textContent || '';

  const changes = Diff.diffWordsWithSpace(textA, textB);
  const diffList: DiffItem[] = [];

  let htmlResult = '';
  let itemCounter = 0;

  for (let i = 0; i < changes.length; i++) {
    const current = changes[i];
    const next = changes[i + 1];

    if (current.removed && next && next.added) {
      itemCounter++;
      const id = `diff-word-${itemCounter}`;
      diffList.push({
        id,
        type: 'modified',
        location: `Thay đổi #${itemCounter}`,
        oldContent: current.value.trim(),
        newContent: next.value.trim()
      });

      htmlResult += `<del class="diff-highlight-del" id="${id}-del">${escapeHtml(
        current.value
      )}</del><mark class="diff-highlight-add" id="${id}">${escapeHtml(
        next.value
      )}</mark>`;
      i++;
    } else if (current.added) {
      itemCounter++;
      const id = `diff-word-${itemCounter}`;
      diffList.push({
        id,
        type: 'added',
        location: `Thêm mới #${itemCounter}`,
        oldContent: '(trống)',
        newContent: current.value.trim()
      });

      htmlResult += `<mark class="diff-highlight-add" id="${id}">${escapeHtml(
        current.value
      )}</mark>`;
    } else if (current.removed) {
      itemCounter++;
      const id = `diff-word-${itemCounter}`;
      diffList.push({
        id,
        type: 'deleted',
        location: `Xóa bỏ #${itemCounter}`,
        oldContent: current.value.trim(),
        newContent: '(đã xóa)'
      });

      htmlResult += `<del class="diff-highlight-del" id="${id}">${escapeHtml(
        current.value
      )}</del>`;
    } else {
      htmlResult += `<span>${escapeHtml(current.value)}</span>`;
    }
  }

  const formattedHtml = htmlResult
    .split('\n\n')
    .map((p) => `<p style="margin-bottom: 12px; line-height: 1.7;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return {
    diffHtml: formattedHtml,
    diffList
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
