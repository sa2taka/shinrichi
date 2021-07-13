import React, { useReducer } from 'react';
import { TruthTable } from './components/TruthTable';
import './App.css';
import { TruthTableGenerator } from './libs/truthTableGenerator';

type ActionType =
  | { type: 'addInput' }
  | { type: 'addOutputName' }
  | { type: 'addOutputValue' };

function reducer(table: TruthTableGenerator, action: ActionType) {
  switch (action.type) {
    case 'addInput':
      return new TruthTableGenerator(table.inputCount + 1, table.outputs);
    case 'addOutputName':
      return table;
    case 'addOutputValue':
      return table;
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
      />
    </div>
  );
}

export default App;
