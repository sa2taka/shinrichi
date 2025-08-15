import React, { memo, useCallback, useState } from "react";
import { TruthTableGenerator } from "../libs/truthTableGenerator";
// Remove unused import - component uses type inference

interface TruthTableProps {
  generator: TruthTableGenerator;
  onAddInput: () => void;
  onRemoveInput: () => void;
  onUpdateOutput: (index: number, expression: string) => void;
  onAddOutput: (expression: string) => void;
  onRemoveOutput: (index: number) => void;
}

export const TruthTable: React.FC<TruthTableProps> = ({
  generator,
  onAddInput,
  onRemoveInput,
  onUpdateOutput,
  onAddOutput,
  onRemoveOutput,
}) => {
  const allColumns = generator.getAllColumns();
  const inputColumns = allColumns.filter((col) => col.type === "input");
  const outputColumns = allColumns.filter((col) => col.type === "output");

  return (
    <div className="truth-table-container">
      <div className="table-wrapper">
        <table className="truth-table">
          <thead>
            <tr>
              {inputColumns.map((column, index) => (
                <th
                  key={`input-${index}`}
                  className="input-header"
                  style={index === inputColumns.length - 1 ? { borderRight: "2px solid #333" } : {}}
                >
                  {column.name}
                </th>
              ))}
              {outputColumns.map((column, index) => (
                <th key={`output-${index}`} className="output-header">
                  <EditableHeader
                    value={column.name}
                    onChange={(value) => onUpdateOutput(index, value)}
                    onRemove={() => onRemoveOutput(index)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: generator.valueCount }, (_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {inputColumns.map((column, colIndex) => (
                  <td
                    key={`input-${rowIndex}-${colIndex}`}
                    className="input-cell"
                    style={colIndex === inputColumns.length - 1 ? { borderRight: "2px solid #333" } : {}}
                  >
                    {column.values[rowIndex] ? "1" : "0"}
                  </td>
                ))}
                {outputColumns.map((column, colIndex) => (
                  <td key={`output-${rowIndex}-${colIndex}`} className="output-cell">
                    {column.values[rowIndex] ? "1" : "0"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="controls">
        <div className="input-controls">
          <button className="add-button" onClick={onAddInput} disabled={generator.inputVariableCount >= 10} title="入力変数を追加">
            + 入力
          </button>
          <button className="remove-button" onClick={onRemoveInput} disabled={generator.inputVariableCount <= 1} title="入力変数を削除">
            - 入力
          </button>
        </div>

        <div className="output-controls">
          <button className="add-button" onClick={() => onAddOutput("")} title="出力式を追加">
            + 出力
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditableHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

const EditableHeader: React.FC<EditableHeaderProps> = memo(({ value, onChange, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSubmit = useCallback(() => {
    setIsEditing(false);
    if (editValue.trim() !== "") {
      onChange(editValue.trim());
    } else {
      setEditValue(value);
    }
  }, [editValue, onChange, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Escape") {
        setEditValue(value);
        setIsEditing(false);
      }
    },
    [handleSubmit, value]
  );

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditValue(value);
  }, [value]);

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        autoFocus
        className="header-input"
        placeholder="論理式を入力"
      />
    );
  }

  return (
    <div className="header-display" onDoubleClick={handleDoubleClick}>
      <span className="header-text">{value || "空の式"}</span>
      <button className="remove-output-button" onClick={onRemove} title="この出力を削除" aria-label="出力を削除">
        ×
      </button>
    </div>
  );
});
