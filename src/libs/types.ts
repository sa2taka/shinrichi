// Truth table types
export interface TruthTableColumn {
  type: "input" | "output";
  name: string;
  values: boolean[];
}

// AST node types for logical expressions
export interface OperatorNode {
  type: "operator";
  value: "&" | "|" | "^";
}

export interface SignNode {
  type: "sign";
  value: "!";
}

export interface LetterNode {
  type: "letter";
  value: string;
}

export interface ParenthesisNode {
  type: "parenthesis";
  value: "(" | ")";
}

export interface NodesGroupNode {
  type: "nodes";
  value: HierarchyNode[];
}

// Union types
export type Node = OperatorNode | LetterNode;
export type TokenNode = Node | SignNode | ParenthesisNode;
export type HierarchyNode = Node | SignNode | NodesGroupNode;

// Priority mapping for operators
export const OPERATOR_PRIORITY = {
  "&": 1,
  "|": 2,
  "^": 3,
} as const;

// Karnaugh Map types
export type CellValue = 0 | 1 | 'X'; // 0, 1, or Don't Care

export interface KarnaughCell {
  row: number;
  col: number;
  value: CellValue;
  minterm: number;
  variables: Record<string, boolean>;
}

export interface KarnaughGroup {
  id: string;
  cells: KarnaughCell[];
  term: string;
  variables: string[];
  isEssential: boolean;
}

export interface KarnaughMapData {
  variableCount: number;
  variables: string[];
  cells: KarnaughCell[][];
  groups: KarnaughGroup[];
  grayCodeRows: string[];
  grayCodeCols: string[];
}

export interface MinimizedExpression {
  sop: string; // Sum of Products
  pos: string; // Product of Sums
  terms: string[];
  minterms: number[];
  maxterms: number[];
}

export type KarnaughMapMode = 'sop' | 'pos'; // Sum of Products or Product of Sums
