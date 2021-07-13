import React, { createRef, useEffect, useState } from 'react';
import { TruthTableGenerator } from '../libs/truthTableGenerator';

import './TruthTable.css';

interface Props {
  table: TruthTableGenerator;
  onAdditionalInput: () => void;
}

export const TruthTable: React.VFC<Props> = ({ table, onAdditionalInput }) => {
  const [addInputButtonLeft, setAddInputButtonLeft] = useState<
    number | undefined
  >(undefined);
  const tableRef = createRef<HTMLTableElement>();

  useEffect(() => {
    const width = tableRef.current?.clientWidth;
    setAddInputButtonLeft(
      width
        ? (((width - 48 * 2) / (table.inputCount + table.outputCount)) *
            table.inputCount) /
            2 +
            48 -
            16
        : undefined
    );
  }, [table]);

  return (
    <div className="table-warapper">
      <table ref={tableRef}>
        <thead>
          <tr>
            {table.value.map((column) => {
              return (
                <th className={column.type} key={column.name}>
                  {column.name}
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
                  {table.value.map((column) => {
                    return (
                      <td
                        className={column.type}
                        key={`row${i}_${column.name}`}
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
        style={{ left: addInputButtonLeft + 'px' }}
        onClick={onAdditionalInput}
      >
        +
      </button>
    </div>
  );
};
