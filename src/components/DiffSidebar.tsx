import { useState, useMemo } from 'react';
import {
  X,
  Search,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  Edit3,
  Layers
} from 'lucide-react';
import type { DiffItem, DiffType } from '../types/office';

interface DiffSidebarProps {
  diffList: DiffItem[];
  activeDiffId: string | null;
  onJumpToDiff: (item: DiffItem) => void;
  onClose: () => void;
  fileAName: string;
  fileBName: string;
  sheetNames?: string[];
  selectedSheetFilter?: string;
  onSelectSheetFilter?: (sheetName: string) => void;
}

export default function DiffSidebar({
  diffList,
  activeDiffId,
  onJumpToDiff,
  onClose,
  fileAName,
  fileBName,
  sheetNames,
  selectedSheetFilter = 'all',
  onSelectSheetFilter
}: DiffSidebarProps) {
  const [filterType, setFilterType] = useState<'all' | DiffType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => {
    let modified = 0;
    let added = 0;
    let deleted = 0;
    diffList.forEach((d) => {
      if (d.type === 'modified') modified++;
      else if (d.type === 'added') added++;
      else if (d.type === 'deleted') deleted++;
    });
    return {
      all: diffList.length,
      modified,
      added,
      deleted
    };
  }, [diffList]);

  const filteredList = useMemo(() => {
    return diffList.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }
      if (
        selectedSheetFilter &&
        selectedSheetFilter !== 'all' &&
        item.sheetName &&
        item.sheetName !== selectedSheetFilter
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inLoc = item.location.toLowerCase().includes(q);
        const inOld = item.oldContent.toLowerCase().includes(q);
        const inNew = item.newContent.toLowerCase().includes(q);
        return inLoc || inOld || inNew;
      }
      return true;
    });
  }, [diffList, filterType, selectedSheetFilter, searchQuery]);

  return (
    <aside className="diff-sidebar-root">
      <div className="diff-sidebar-header">
        <div className="diff-header-left">
          <div className="diff-header-title-wrap">
            <span className="diff-header-title">Danh Sách Khác Biệt</span>
            <span className="diff-count-badge">{diffList.length}</span>
          </div>
          <span className="diff-file-compare-sub" title={`${fileAName} ⟷ ${fileBName}`}>
            {fileAName} ⟷ {fileBName}
          </span>
        </div>
        <button
          type="button"
          className="diff-close-btn"
          onClick={onClose}
          title="Đóng bảng so sánh"
        >
          <X size={16} />
        </button>
      </div>

      <div className="diff-search-bar">
        <Search size={14} className="diff-search-icon" />
        <input
          type="text"
          className="diff-search-input"
          placeholder="Tìm vị trí, nội dung cũ hoặc mới..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="diff-search-clear"
            onClick={() => setSearchQuery('')}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {sheetNames && sheetNames.length > 1 && onSelectSheetFilter && (
        <div className="diff-sheet-selector">
          <Layers size={13} className="text-muted" />
          <select
            className="diff-sheet-select"
            value={selectedSheetFilter}
            onChange={(e) => onSelectSheetFilter(e.target.value)}
          >
            <option value="all">Tất cả trang tính ({diffList.length})</option>
            {sheetNames.map((name) => {
              const sheetCount = diffList.filter((d) => d.sheetName === name).length;
              return (
                <option key={name} value={name}>
                  {name} ({sheetCount})
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="diff-filter-tabs">
        <button
          type="button"
          className={`diff-tab-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Tất cả <span className="tab-pill">{counts.all}</span>
        </button>
        <button
          type="button"
          className={`diff-tab-btn modified ${filterType === 'modified' ? 'active' : ''}`}
          onClick={() => setFilterType('modified')}
        >
          Sửa <span className="tab-pill">{counts.modified}</span>
        </button>
        <button
          type="button"
          className={`diff-tab-btn added ${filterType === 'added' ? 'active' : ''}`}
          onClick={() => setFilterType('added')}
        >
          Thêm <span className="tab-pill">{counts.added}</span>
        </button>
        <button
          type="button"
          className={`diff-tab-btn deleted ${filterType === 'deleted' ? 'active' : ''}`}
          onClick={() => setFilterType('deleted')}
        >
          Xóa <span className="tab-pill">{counts.deleted}</span>
        </button>
      </div>

      <div className="diff-items-container">
        {filteredList.length === 0 ? (
          <div className="diff-empty-notice">
            <p>Không tìm thấy khác biệt nào phù hợp.</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isActive = item.id === activeDiffId;
            return (
              <div
                key={item.id}
                className={`diff-item-card ${item.type} ${isActive ? 'active' : ''}`}
                onClick={() => onJumpToDiff(item)}
              >
                <div className="diff-item-top">
                  <div className="diff-item-badge">
                    {item.type === 'modified' && <Edit3 size={12} className="text-amber" />}
                    {item.type === 'added' && <PlusCircle size={12} className="text-green" />}
                    {item.type === 'deleted' && <MinusCircle size={12} className="text-red" />}
                    <span className="diff-type-label">
                      {item.type === 'modified' ? 'Thay đổi' : item.type === 'added' ? 'Thêm mới' : 'Xóa bỏ'}
                    </span>
                  </div>
                  <span className="diff-item-location">{item.location}</span>
                </div>

                <div className="diff-item-content">
                  {item.type === 'modified' && (
                    <>
                      <div className="diff-content-line old">
                        <span className="sign">-</span>
                        <span className="text">{item.oldContent}</span>
                      </div>
                      <div className="diff-content-line new">
                        <span className="sign">+</span>
                        <span className="text">{item.newContent}</span>
                      </div>
                    </>
                  )}
                  {item.type === 'added' && (
                    <div className="diff-content-line new">
                      <span className="sign">+</span>
                      <span className="text">{item.newContent}</span>
                    </div>
                  )}
                  {item.type === 'deleted' && (
                    <div className="diff-content-line old">
                      <span className="sign">-</span>
                      <span className="text">{item.oldContent}</span>
                    </div>
                  )}
                </div>

                <div className="diff-item-footer">
                  <span className="jump-hint">
                    Nhấn để nhảy tới vị trí
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="diff-sidebar-summary">
        <span className="stat modified">{counts.modified} sửa</span>
        <span className="stat-dot">&bull;</span>
        <span className="stat added">+{counts.added} thêm</span>
        <span className="stat-dot">&bull;</span>
        <span className="stat deleted">-{counts.deleted} xóa</span>
      </div>
    </aside>
  );
}
