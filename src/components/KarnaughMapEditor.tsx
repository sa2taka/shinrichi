import React, { memo, useCallback } from 'react';
import type { KarnaughMapData } from '../libs/types';

interface KarnaughMapEditorProps {
  mapData: KarnaughMapData;
  onCellClick: (row: number, col: number) => void;
  onVariableCountChange: (count: number) => void;
  onClearMap: () => void;
  showGroups?: boolean;
}

export const KarnaughMapEditor: React.FC<KarnaughMapEditorProps> = ({
  mapData,
  onCellClick,
  onVariableCountChange,
  onClearMap,
  showGroups = true,
}) => {
  const { variableCount, variables, cells, groups, grayCodeRows, grayCodeCols } = mapData;

  const handleCellClick = useCallback((row: number, col: number) => {
    onCellClick(row, col);
  }, [onCellClick]);

  const getCellConditions = useCallback((row: number, col: number): string => {
    const cell = cells[row]?.[col];
    if (!cell) return '';
    
    const conditions: string[] = [];
    for (const variable of variables) {
      const isTrue = cell.variables[variable];
      conditions.push(isTrue ? variable : `¬${variable}`);
    }
    
    return conditions.join(' ');
  }, [cells, variables]);

  const renderCell = useCallback((cell: any, groupColors: string[]) => {
    const { row, col, value } = cell;
    const conditions = getCellConditions(row, col);
    
    return (
      <td
        key={`cell-${row}-${col}`}
        className={`karnaugh-cell ${value === 1 ? 'active' : value === 'X' ? 'dont-care' : 'inactive'}`}
        onClick={() => handleCellClick(row, col)}
        style={{
          backgroundColor: groupColors.length > 0 ? groupColors[0] : undefined,
          backgroundImage: groupColors.length > 1 
            ? `linear-gradient(45deg, ${groupColors.join(', ')})` 
            : undefined,
        }}
      >
        <div className="cell-content">
          <span className="cell-value">{value === 'X' ? 'X' : value}</span>
          <span className="cell-conditions">{conditions}</span>
        </div>
      </td>
    );
  }, [handleCellClick, getCellConditions]);

  const getCellGroupColors = useCallback((row: number, col: number): string[] => {
    if (!showGroups) return [];
    
    const cellGroups = groups.filter(group =>
      group.cells.some(cell => cell.row === row && cell.col === col)
    );
    
    const colors = ['#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff', '#99ffff'];
    return cellGroups.map((_, index) => colors[index % colors.length]);
  }, [groups, showGroups]);

  const renderVariableLabels = () => {
    if (variableCount === 2) {
      return (
        <>
          <div className="variable-label row-label">
            <span>{variables[0]}</span>
          </div>
          <div className="variable-label col-label">
            <span>{variables[1]}</span>
          </div>
        </>
      );
    } else if (variableCount === 3) {
      return (
        <>
          <div className="variable-label row-label">
            <span>{variables[0]}</span>
          </div>
          <div className="variable-label col-label">
            <span>{variables[1]}{variables[2]}</span>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="variable-label row-label">
            <span>{variables[0]}{variables[1]}</span>
          </div>
          <div className="variable-label col-label">
            <span>{variables[2]}{variables[3]}</span>
          </div>
        </>
      );
    }
  };

  return (
    <div className="karnaugh-map-editor">
      <div className="karnaugh-controls">
        <div className="variable-count-control">
          <label>変数の数:</label>
          <select
            value={variableCount}
            onChange={(e) => onVariableCountChange(parseInt(e.target.value))}
          >
            <option value={2}>2変数</option>
            <option value={3}>3変数</option>
            <option value={4}>4変数</option>
          </select>
        </div>
        
        <button
          className="clear-button"
          onClick={onClearMap}
          title="カルノー図をクリア"
        >
          クリア
        </button>
      </div>

      <div className="karnaugh-map-container">
        {renderVariableLabels()}
        
        <table className="karnaugh-map">
          <thead>
            <tr>
              <th className="corner-cell"></th>
              {grayCodeCols.map((code, index) => (
                <th key={`col-${index}`} className="header-cell">
                  {code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((rowCells, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <th className="header-cell">
                  {grayCodeRows[rowIndex]}
                </th>
                {rowCells.map((cell) => 
                  renderCell(cell, getCellGroupColors(cell.row, cell.col))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showGroups && groups.length > 0 && (
        <div className="group-legend">
          <h4>検出されたグループ:</h4>
          <ul>
            {groups.map((group, index) => (
              <li key={group.id} className="group-item">
                <span 
                  className="group-color"
                  style={{ backgroundColor: ['#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff', '#99ffff'][index % 6] }}
                ></span>
                <span className="group-term">{group.term}</span>
                {group.isEssential && <span className="essential-badge">必須</span>}
                <span className="group-cells">
                  ({group.cells.map(cell => cell.minterm).join(', ')})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}


      <div className="karnaugh-instructions">
        <h4>操作方法:</h4>
        <ul>
          <li>セルをクリックして値を変更 (0 → 1 → X → 0)</li>
          <li>0: 偽, 1: 真, X: Don't Care</li>
          <li>各セル内に論理条件が表示されます</li>
          <li>グループが自動的に検出・表示されます</li>
        </ul>
      </div>
    </div>
  );
};

export default memo(KarnaughMapEditor);