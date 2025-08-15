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
