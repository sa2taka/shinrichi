import type { KarnaughMapData, KarnaughCell, CellValue } from './types';

/**
 * Generate Gray Code sequence for given number of bits
 */
function generateGrayCode(n: number): string[] {
  if (n === 1) return ['0', '1'];
  
  const prev = generateGrayCode(n - 1);
  const result: string[] = [];
  
  // Add 0 prefix to previous codes
  for (const code of prev) {
    result.push('0' + code);
  }
  
  // Add 1 prefix to reversed previous codes
  for (let i = prev.length - 1; i >= 0; i--) {
    result.push('1' + prev[i]);
  }
  
  return result;
}

// Removed unused function binaryToDecimal

/**
 * Get variable assignments for given row and column in Karnaugh map
 */
function getVariableAssignments(
  row: number, 
  col: number, 
  variableCount: number, 
  variables: string[]
): Record<string, boolean> {
  const assignments: Record<string, boolean> = {};
  
  if (variableCount === 2) {
    // 2 variables: A (row), B (col)
    assignments[variables[0]] = row === 1;
    assignments[variables[1]] = col === 1;
  } else if (variableCount === 3) {
    // 3 variables: A (row), B,C (col)
    const grayCodeCols = generateGrayCode(2);
    const colBinary = grayCodeCols[col];
    
    assignments[variables[0]] = row === 1;
    assignments[variables[1]] = colBinary[0] === '1';
    assignments[variables[2]] = colBinary[1] === '1';
  } else if (variableCount === 4) {
    // 4 variables: A,B (row), C,D (col)
    const grayCodeRows = generateGrayCode(2);
    const grayCodeCols = generateGrayCode(2);
    const rowBinary = grayCodeRows[row];
    const colBinary = grayCodeCols[col];
    
    assignments[variables[0]] = rowBinary[0] === '1';
    assignments[variables[1]] = rowBinary[1] === '1';
    assignments[variables[2]] = colBinary[0] === '1';
    assignments[variables[3]] = colBinary[1] === '1';
  }
  
  return assignments;
}

/**
 * Calculate minterm number from variable assignments
 */
function calculateMinterm(variables: Record<string, boolean>, variableOrder: string[]): number {
  let minterm = 0;
  for (let i = 0; i < variableOrder.length; i++) {
    if (variables[variableOrder[i]]) {
      minterm += Math.pow(2, variableOrder.length - 1 - i);
    }
  }
  return minterm;
}

/**
 * Create empty Karnaugh Map data structure
 */
export function createKarnaughMap(variableCount: number, variables: string[]): KarnaughMapData {
  if (variableCount < 2 || variableCount > 4) {
    throw new Error('Karnaugh map supports 2-4 variables only');
  }
  
  const rows = variableCount <= 2 ? 2 : (variableCount === 3 ? 2 : 4);
  const cols = variableCount <= 2 ? 2 : 4;
  
  // Generate Gray code sequences
  const grayCodeRows = generateGrayCode(variableCount <= 2 ? 1 : (variableCount === 3 ? 1 : 2));
  const grayCodeCols = generateGrayCode(variableCount <= 2 ? 1 : 2);
  
  // Initialize cells
  const cells: KarnaughCell[][] = [];
  
  for (let row = 0; row < rows; row++) {
    cells[row] = [];
    for (let col = 0; col < cols; col++) {
      const variableAssignments = getVariableAssignments(row, col, variableCount, variables);
      const minterm = calculateMinterm(variableAssignments, variables);
      
      cells[row][col] = {
        row,
        col,
        value: 0,
        minterm,
        variables: variableAssignments,
      };
    }
  }
  
  return {
    variableCount,
    variables,
    cells,
    groups: [],
    grayCodeRows,
    grayCodeCols,
  };
}

/**
 * Update cell value in Karnaugh map
 */
export function updateKarnaughCell(
  mapData: KarnaughMapData, 
  row: number, 
  col: number, 
  value: CellValue
): KarnaughMapData {
  const newMapData = { ...mapData };
  newMapData.cells = mapData.cells.map((rowCells, r) =>
    rowCells.map((cell, c) => 
      r === row && c === col ? { ...cell, value } : cell
    )
  );
  return newMapData;
}

/**
 * Set Karnaugh map from truth table values
 */
export function setKarnaughFromTruthTable(
  mapData: KarnaughMapData,
  truthValues: boolean[]
): KarnaughMapData {
  const newMapData = { ...mapData };
  newMapData.cells = mapData.cells.map(rowCells =>
    rowCells.map(cell => ({
      ...cell,
      value: truthValues[cell.minterm] ? 1 : 0 as CellValue
    }))
  );
  return newMapData;
}

/**
 * Convert Karnaugh map to truth table values
 */
export function karnaughToTruthTable(mapData: KarnaughMapData): boolean[] {
  const truthValues = new Array(Math.pow(2, mapData.variableCount)).fill(false);
  
  for (const rowCells of mapData.cells) {
    for (const cell of rowCells) {
      if (cell.value === 1) {
        truthValues[cell.minterm] = true;
      }
    }
  }
  
  return truthValues;
}

/**
 * Get all minterms (cells with value 1) from Karnaugh map
 */
export function getMinterms(mapData: KarnaughMapData): number[] {
  const minterms: number[] = [];
  
  for (const rowCells of mapData.cells) {
    for (const cell of rowCells) {
      if (cell.value === 1) {
        minterms.push(cell.minterm);
      }
    }
  }
  
  return minterms.sort((a, b) => a - b);
}

/**
 * Get all maxterms (cells with value 0) from Karnaugh map
 */
export function getMaxterms(mapData: KarnaughMapData): number[] {
  const maxterms: number[] = [];
  
  for (const rowCells of mapData.cells) {
    for (const cell of rowCells) {
      if (cell.value === 0) {
        maxterms.push(cell.minterm);
      }
    }
  }
  
  return maxterms.sort((a, b) => a - b);
}