import React, { createRef, useEffect, useState } from 'react';
import { TruthTableGenerator } from '../libs/truthTableGenerator';

import './TruthTable.css';

interface Props {
  table: TruthTableGenerator;
  onAdditionalInput: () => void;
  onAdditionalOutput: (value: string, index?: number) => void;
}

export const TruthTable: React.VFC<Props> = ({
  table,
  onAdditionalInput,
  onAdditionalOutput,
}) => {
  return (
    <div className="table-warapper">
      <table>
        <thead>
          <tr>
            {table.value.map((column, i) => {
              return (
                <th
                  className={column.type}
                  key={
                    'header' +
                    column.type +
                    (column.type === 'output' ? i - table.inputCount : i)
                  }
                  style={
                    column.type === 'input' &&
                    table.value[i + 1]?.type === 'output'
                      ? {
                          paddingRight: '2em',
                          borderRight: 'solid 1px black',
                        }
                      : {}
                  }
                >
                  {column.type === 'output' ? (
                    <OutputHeader
                      onChange={(value) => {
                        onAdditionalOutput(value, i);
                      }}
                      value={column.name}
                    />
                  ) : (
                    column.name
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {Array(table.valueCount)
            .fill(undefined)
            .map((_, i) => {
              return (
                <tr key={`row${i}`}>
                  {table.value.map((column, j) => {
                    return (
                      <td
                        className={column.type}
                        key={`row${i}_${column.name}_${column.type}_${
                          column.type === 'output' ? j - table.inputCount : j
                        }`}
                        style={
                          column.type === 'input' &&
                          table.value[j + 1]?.type === 'output'
                            ? {
                                paddingRight: '2em',
                                borderRight: 'solid 1px black',
                              }
                            : {}
                        }
                      >
                        {column.values[i] ? '1' : '0'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
      <button
        className="btn add-input-button"
        style={{ left: '64px' }}
        onClick={onAdditionalInput}
      >
        +
      </button>

      <button
        className="btn add-input-button"
        style={{ right: '64px' }}
        onClick={() => onAdditionalOutput('')}
      >
        +
      </button>
    </div>
  );
};

const OutputHeader: React.VFC<{
  onChange: (input: string) => void;
  value?: string;
}> = ({ onChange, value: initial }) => {
  const [inputting, setInputting] = useState(false);
  const [value, setValue] = useState(initial ?? '');

  return inputting || value === '' ? (
    <input
      onDoubleClick={() => setInputting(false)}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setInputting(false);
          setValue((e.target as HTMLInputElement).value);
        }
      }}
      onBlur={(e) => {
        setInputting(false);
        setValue(e.target.value);
      }}
      defaultValue={value}
    />
  ) : (
    <div onDoubleClick={() => setInputting(true)}>{value}</div>
  );
};
