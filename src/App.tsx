import { useState, useCallback } from 'react';
import "./App.css";
import { TruthTable } from "./components/TruthTable";
import { KarnaughMapEditor } from "./components/KarnaughMapEditor";
import { MinimizedFormulaDisplay } from "./components/MinimizedFormulaDisplay";
import { useTruthTableState } from "./hooks/useTruthTableState";
import { useKarnaughMapState } from "./hooks/useKarnaughMapState";

type AppMode = 'truth-table' | 'karnaugh-map';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('truth-table');
  
  const truthTableState = useTruthTableState();
  const karnaughState = useKarnaughMapState(3, ['A', 'B', 'C']);

  const switchToTruthTable = useCallback(() => {
    setAppMode('truth-table');
  }, []);

  const switchToKarnaughMap = useCallback(() => {
    setAppMode('karnaugh-map');
  }, []);

  // Export from Karnaugh map to truth table
  const exportKarnaughToTruthTable = useCallback(() => {
    if (karnaughState.minimizedExpression && karnaughState.currentExpression) {
      // Add the optimized expression as a new output in truth table
      truthTableState.actions.addOutput(karnaughState.currentExpression);
      
      // Set the same number of variables
      const targetVariableCount = karnaughState.variableCount;
      const currentVariableCount = truthTableState.generator.inputVariableCount;
      
      if (targetVariableCount !== currentVariableCount) {
        // Adjust variable count to match
        const diff = targetVariableCount - currentVariableCount;
        for (let i = 0; i < Math.abs(diff); i++) {
          if (diff > 0) {
            truthTableState.actions.addInput();
          } else {
            truthTableState.actions.removeInput();
          }
        }
      }
      
      switchToTruthTable();
    }
  }, [karnaughState, truthTableState, switchToTruthTable]);

  // Import from truth table to Karnaugh map
  const importTruthTableToKarnaugh = useCallback(() => {
    const truthValues = truthTableState.truthTableValues;
    const variableCount = truthTableState.generator.inputVariableCount;
    
    if (variableCount >= 2 && variableCount <= 4) {
      // Set variable count and import truth values
      karnaughState.actions.setVariableCount(variableCount);
      setTimeout(() => {
        karnaughState.actions.setFromTruthTable(truthValues);
      }, 100); // Allow state to update
      
      switchToKarnaughMap();
    }
  }, [truthTableState, karnaughState, switchToKarnaughMap]);

  const renderModeSelector = () => (
    <div className="mode-selector">
      <button
        className={`mode-button ${appMode === 'truth-table' ? 'active' : ''}`}
        onClick={switchToTruthTable}
      >
        真理値表
      </button>
      <button
        className={`mode-button ${appMode === 'karnaugh-map' ? 'active' : ''}`}
        onClick={switchToKarnaughMap}
      >
        カルノー図
      </button>
    </div>
  );

  const renderTruthTableMode = () => (
    <>
      <div className="instructions">
        <h2>使い方</h2>
        <ul>
          <li>出力列のヘッダーをダブルクリックで論理式を編集できます</li>
          <li>使用可能な演算子: & (AND), | (OR), ^ (XOR), ! (NOT), ( ) (括弧)</li>
          <li>変数名: p, q, r, s, ... (自動的に割り当てられます)</li>
          <li>入力・出力列の追加/削除が可能です</li>
          <li>カルノー図モードに切り替えて論理式を最適化できます</li>
        </ul>
        
        <div className="mode-actions">
          <button
            className="import-button"
            onClick={importTruthTableToKarnaugh}
            disabled={truthTableState.generator.inputVariableCount < 2 || truthTableState.generator.inputVariableCount > 4}
            title="真理値表をカルノー図にインポート（2-4変数のみ対応）"
          >
            カルノー図にインポート
          </button>
        </div>
      </div>

      <TruthTable
        generator={truthTableState.generator}
        onAddInput={truthTableState.actions.addInput}
        onRemoveInput={truthTableState.actions.removeInput}
        onUpdateOutput={truthTableState.actions.updateOutput}
        onAddOutput={truthTableState.actions.addOutput}
        onRemoveOutput={truthTableState.actions.removeOutput}
      />

      <div className="info">
        <p>
          現在の入力変数数: {truthTableState.generator.inputVariableCount} | 
          真理値の組み合わせ: {truthTableState.generator.valueCount} | 
          出力式数: {truthTableState.generator.outputCount}
        </p>
      </div>
    </>
  );

  const renderKarnaughMapMode = () => (
    <>
      <div className="instructions">
        <h2>使い方</h2>
        <ul>
          <li>セルをクリックして値を変更できます (0 → 1 → X → 0)</li>
          <li>0: 偽, 1: 真, X: Don't Care (任意)</li>
          <li>グループが自動的に検出され、最適な論理式が生成されます</li>
          <li>SOP (積和標準形) と POS (和積標準形) を切り替えられます</li>
        </ul>
      </div>

      <div className="karnaugh-content">
        <div className="karnaugh-left">
          <KarnaughMapEditor
            mapData={karnaughState.mapData}
            onCellClick={karnaughState.actions.toggleCell}
            onVariableCountChange={karnaughState.actions.setVariableCount}
            onClearMap={karnaughState.actions.clearMap}
          />
        </div>
        
        <div className="karnaugh-right">
          <MinimizedFormulaDisplay
            expression={karnaughState.minimizedExpression}
            mode={karnaughState.mode}
            onModeChange={karnaughState.actions.setMode}
            onExportToTruthTable={exportKarnaughToTruthTable}
            currentFormula={karnaughState.currentExpression}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>論理回路設計支援ツール</h1>
        <p>真理値表とカルノー図で論理式を設計・最適化します</p>
        {renderModeSelector()}
      </header>

      <main className="app-main">
        {appMode === 'truth-table' ? renderTruthTableMode() : renderKarnaughMapMode()}
      </main>
    </div>
  );
}

export default App;
