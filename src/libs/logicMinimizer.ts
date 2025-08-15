import type { 
  KarnaughMapData, 
  KarnaughCell, 
  KarnaughGroup, 
  MinimizedExpression,
  CellValue
} from './types';

/**
 * Check if two cells are adjacent in Karnaugh map (considering wrap-around)
 */
function areAdjacent(cell1: KarnaughCell, cell2: KarnaughCell, mapData: KarnaughMapData): boolean {
  const rows = mapData.cells.length;
  const cols = mapData.cells[0].length;
  
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);
  
  // Adjacent in same row
  if (cell1.row === cell2.row && (colDiff === 1 || colDiff === cols - 1)) {
    return true;
  }
  
  // Adjacent in same column
  if (cell1.col === cell2.col && (rowDiff === 1 || rowDiff === rows - 1)) {
    return true;
  }
  
  return false;
}

/**
 * Check if cells form a rectangular group (power of 2 size)
 */
function isValidGroup(cells: KarnaughCell[], mapData: KarnaughMapData): boolean {
  if (cells.length === 0 || (cells.length & (cells.length - 1)) !== 0) {
    return false; // Must be power of 2
  }
  
  if (cells.length === 1) return true;
  
  // Check if all cells are connected
  const visited = new Set<string>();
  const queue = [cells[0]];
  visited.add(`${cells[0].row},${cells[0].col}`);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    for (const cell of cells) {
      const key = `${cell.row},${cell.col}`;
      if (!visited.has(key) && areAdjacent(current, cell, mapData)) {
        visited.add(key);
        queue.push(cell);
      }
    }
  }
  
  return visited.size === cells.length;
}

/**
 * Generate term string from group of cells
 */
function generateTermFromGroup(group: KarnaughCell[], variables: string[]): string {
  if (group.length === 0) return '';
  
  const terms: string[] = [];
  
  // Find which variables are constant across all cells in the group
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const firstValue = group[0].variables[variable];
    
    // Check if all cells have the same value for this variable
    const isConstant = group.every(cell => cell.variables[variable] === firstValue);
    
    if (isConstant) {
      terms.push(firstValue ? variable : `!${variable}`);
    }
  }
  
  return terms.join(' & ') || '1';
}

/**
 * Find all possible groups in Karnaugh map
 */
function findAllGroups(mapData: KarnaughMapData): KarnaughGroup[] {
  const groups: KarnaughGroup[] = [];
  const oneCells: KarnaughCell[] = [];
  
  // Collect all cells with value 1
  for (const rowCells of mapData.cells) {
    for (const cell of rowCells) {
      if (cell.value === 1) {
        oneCells.push(cell);
      }
    }
  }
  
  if (oneCells.length === 0) return [];
  
  // Generate all possible groups (power of 2 sizes)
  const maxGroupSize = Math.min(16, Math.pow(2, Math.floor(Math.log2(oneCells.length)) + 1));
  
  for (let groupSize = maxGroupSize; groupSize >= 1; groupSize /= 2) {
    const combinations = generateCombinations(oneCells, groupSize);
    
    for (const combination of combinations) {
      if (isValidGroup(combination, mapData)) {
        const term = generateTermFromGroup(combination, mapData.variables);
        const groupId = `group_${combination.map(c => `${c.row}_${c.col}`).sort().join('_')}`;
        
        groups.push({
          id: groupId,
          cells: combination,
          term,
          variables: mapData.variables,
          isEssential: false,
        });
      }
    }
  }
  
  return groups;
}

/**
 * Generate all combinations of given size from array
 */
function generateCombinations<T>(arr: T[], size: number): T[][] {
  if (size === 1) return arr.map(item => [item]);
  if (size === arr.length) return [arr];
  if (size > arr.length || size < 1) return [];
  
  const result: T[][] = [];
  
  for (let i = 0; i <= arr.length - size; i++) {
    const first = arr[i];
    const rest = generateCombinations(arr.slice(i + 1), size - 1);
    
    for (const combination of rest) {
      result.push([first, ...combination]);
    }
  }
  
  return result;
}

/**
 * Find essential prime implicants
 */
function findEssentialPrimeImplicants(
  groups: KarnaughGroup[], 
  oneCells: KarnaughCell[]
): KarnaughGroup[] {
  const essential: KarnaughGroup[] = [];
  const coveredCells = new Set<string>();
  
  for (const cell of oneCells) {
    const cellKey = `${cell.row},${cell.col}`;
    if (coveredCells.has(cellKey)) continue;
    
    // Find all groups that cover this cell
    const coveringGroups = groups.filter(group =>
      group.cells.some(groupCell => 
        groupCell.row === cell.row && groupCell.col === cell.col
      )
    );
    
    if (coveringGroups.length === 1) {
      // This is an essential prime implicant
      const essentialGroup = { ...coveringGroups[0], isEssential: true };
      essential.push(essentialGroup);
      
      // Mark all cells in this group as covered
      for (const groupCell of essentialGroup.cells) {
        coveredCells.add(`${groupCell.row},${groupCell.col}`);
      }
    }
  }
  
  return essential;
}

/**
 * Select minimum set of groups to cover all 1s
 */
function selectMinimumCover(
  groups: KarnaughGroup[], 
  oneCells: KarnaughCell[]
): KarnaughGroup[] {
  // First, get essential prime implicants
  const essential = findEssentialPrimeImplicants(groups, oneCells);
  const coveredCells = new Set<string>();
  
  // Mark cells covered by essential groups
  for (const group of essential) {
    for (const cell of group.cells) {
      coveredCells.add(`${cell.row},${cell.col}`);
    }
  }
  
  // Find remaining uncovered cells
  const uncoveredCells = oneCells.filter(cell => 
    !coveredCells.has(`${cell.row},${cell.col}`)
  );
  
  if (uncoveredCells.length === 0) {
    return essential;
  }
  
  // Simple greedy algorithm for remaining coverage
  const remainingGroups = groups.filter(group => 
    !essential.some(essGroup => essGroup.id === group.id)
  );
  
  const selectedGroups = [...essential];
  const stillUncovered = new Set(
    uncoveredCells.map(cell => `${cell.row},${cell.col}`)
  );
  
  while (stillUncovered.size > 0) {
    // Find group that covers most uncovered cells
    let bestGroup: KarnaughGroup | null = null;
    let maxCoverage = 0;
    
    for (const group of remainingGroups) {
      const coverage = group.cells.filter(cell =>
        stillUncovered.has(`${cell.row},${cell.col}`)
      ).length;
      
      if (coverage > maxCoverage) {
        maxCoverage = coverage;
        bestGroup = group;
      }
    }
    
    if (bestGroup) {
      selectedGroups.push(bestGroup);
      
      // Remove covered cells
      for (const cell of bestGroup.cells) {
        stillUncovered.delete(`${cell.row},${cell.col}`);
      }
      
      // Remove this group from consideration
      const index = remainingGroups.indexOf(bestGroup);
      if (index > -1) {
        remainingGroups.splice(index, 1);
      }
    } else {
      break; // No more groups can cover remaining cells
    }
  }
  
  return selectedGroups;
}

/**
 * Minimize logic expression using Karnaugh map
 */
export function minimizeLogicExpression(mapData: KarnaughMapData): MinimizedExpression {
  const oneCells: KarnaughCell[] = [];
  const zeroCells: KarnaughCell[] = [];
  
  // Collect 1s and 0s
  for (const rowCells of mapData.cells) {
    for (const cell of rowCells) {
      if (cell.value === 1) {
        oneCells.push(cell);
      } else if (cell.value === 0) {
        zeroCells.push(cell);
      }
    }
  }
  
  // Find all possible groups
  const allGroups = findAllGroups(mapData);
  
  // Select minimum cover for SOP (Sum of Products)
  const sopGroups = selectMinimumCover(allGroups, oneCells);
  const sopTerms = sopGroups.map(group => group.term).filter(term => term !== '');
  const sopExpression = sopTerms.length > 0 ? sopTerms.join(' | ') : '0';
  
  // For POS (Product of Sums), we work with 0s and complement
  const posMapData = { ...mapData };
  posMapData.cells = mapData.cells.map(rowCells =>
    rowCells.map(cell => ({
      ...cell,
      value: cell.value === 0 ? (1 as CellValue) : (cell.value === 1 ? (0 as CellValue) : ('X' as CellValue))
    }))
  );
  
  const posGroups = selectMinimumCover(findAllGroups(posMapData), zeroCells);
  const posTerms = posGroups.map(group => {
    // Complement the terms for POS
    const term = group.term;
    if (term === '1') return '0';
    
    // Convert AND terms to OR terms with complemented literals
    const literals = term.split(' & ').map(lit => {
      if (lit.startsWith('!')) {
        return lit.substring(1); // Remove negation
      } else {
        return `!${lit}`; // Add negation
      }
    });
    
    return `(${literals.join(' | ')})`;
  }).filter(term => term !== '');
  
  const posExpression = posTerms.length > 0 ? posTerms.join(' & ') : '1';
  
  return {
    sop: sopExpression,
    pos: posExpression,
    terms: sopTerms,
    minterms: oneCells.map(cell => cell.minterm).sort((a, b) => a - b),
    maxterms: zeroCells.map(cell => cell.minterm).sort((a, b) => a - b),
  };
}

/**
 * Update Karnaugh map with detected groups
 */
export function updateKarnaughMapWithGroups(mapData: KarnaughMapData): KarnaughMapData {
  const oneCells: KarnaughCell[] = [];
  
  // Collect all cells with value 1
  for (const rowCells of mapData.cells) {
    for (const cell of rowCells) {
      if (cell.value === 1) {
        oneCells.push(cell);
      }
    }
  }
  
  const allGroups = findAllGroups(mapData);
  const selectedGroups = selectMinimumCover(allGroups, oneCells);
  
  return {
    ...mapData,
    groups: selectedGroups,
  };
}