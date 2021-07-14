import React, { useReducer } from 'react';
import { TruthTable } from './components/TruthTable';
import './App.css';
import { TruthTableGenerator } from './libs/truthTableGenerator';
import { generateReversePolish } from './libs/reversePolish';

type ActionType =
  | { type: 'addInput' }
  | { type: 'addOutputName'; value: string; index?: number };

function reducer(table: TruthTableGenerator, action: ActionType) {
  switch (action.type) {
    case 'addInput':
      if (table.inputCount >= 4) {
        return table;
      }
      return new TruthTableGenerator(table.inputCount + 1, table.outputs);
    case 'addOutputName':
      const output = table.outputs;
      if (action.index) {
        output[action.index - table.inputCount] = action.value;
      }
      return new TruthTableGenerator(table.inputCount, output);
  }
}

function App() {
  const [table, dispatch] = useReducer(reducer, new TruthTableGenerator());

  return (
    <div className="App container">
      <TruthTable
        table={table}
        onAdditionalInput={() => {
          dispatch({ type: 'addInput' });
        }}
        onAdditionalOutput={(value, index) => {
          dispatch({ type: 'addOutputName', value, index });
        }}
      />
    </div>
  );
}

export default App;
