import "./App.css";
import { TruthTable } from "./components/TruthTable";
import { useTruthTableState } from "./hooks/useTruthTableState";

function App() {
  const { generator, actions } = useTruthTableState();

  return (
    <div className="app">
      <header className="app-header">
        <h1>真理値表ジェネレータ</h1>
        <p>論理式を入力して真理値表を生成します</p>
      </header>

      <main className="app-main">
        <div className="instructions">
          <h2>使い方</h2>
          <ul>
            <li>出力列のヘッダーをダブルクリックで論理式を編集できます</li>
            <li>使用可能な演算子: & (AND), | (OR), ^ (XOR), ! (NOT), ( ) (括弧)</li>
            <li>変数名: p, q, r, s, ... (自動的に割り当てられます)</li>
            <li>入力・出力列の追加/削除が可能です</li>
          </ul>
        </div>

        <TruthTable
          generator={generator}
          onAddInput={actions.addInput}
          onRemoveInput={actions.removeInput}
          onUpdateOutput={actions.updateOutput}
          onAddOutput={actions.addOutput}
          onRemoveOutput={actions.removeOutput}
        />

        <div className="info">
          <p>
            現在の入力変数数: {generator.inputVariableCount} | 真理値の組み合わせ: {generator.valueCount} | 出力式数:{" "}
            {generator.outputCount}
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
