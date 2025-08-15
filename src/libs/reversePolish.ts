import type { HierarchyNode, Node, OperatorNode, TokenNode } from "./types";
import { OPERATOR_PRIORITY } from "./types";

/**
 * Parse a logical expression and generate reverse Polish notation
 * @param expression - The logical expression to parse
 * @returns Array of nodes in reverse Polish notation
 */
export function generateReversePolish(expression: string): Node[] {
  const tokens = tokenizeExpression(expression);
  const hierarchy = parseHierarchy(tokens);
  return convertToReversePolish(hierarchy);
}

/**
 * Tokenize the input expression into nodes
 * @param expression - The logical expression string
 * @returns Array of token nodes
 */
function tokenizeExpression(expression: string): TokenNode[] {
  let currentValue = "";
  const result: TokenNode[] = [];

  for (const char of expression) {
    if (char === " ") continue;

    if (char === "&" || char === "|" || char === "^") {
      if (currentValue !== "") {
        result.push({ type: "letter", value: currentValue });
        currentValue = "";
      }
      result.push({ type: "operator", value: char });
    } else if (char === "(" || char === ")") {
      if (currentValue !== "") {
        result.push({ type: "letter", value: currentValue });
        currentValue = "";
      }
      result.push({ type: "parenthesis", value: char });
    } else if (char === "!") {
      if (currentValue !== "") {
        result.push({ type: "letter", value: currentValue });
        currentValue = "";
      }
      result.push({ type: "sign", value: char });
    } else {
      currentValue += char;
    }
  }

  if (currentValue !== "") {
    result.push({ type: "letter", value: currentValue });
  }

  return result;
}

/**
 * Parse parentheses hierarchy in the token array
 * @param tokens - Array of token nodes
 * @returns Array of hierarchy nodes
 */
function parseHierarchy(tokens: TokenNode[]): HierarchyNode[] {
  const result: HierarchyNode[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "parenthesis" && token.value === "(") {
      let depth = 1;
      let j = i + 1;

      while (j < tokens.length && depth > 0) {
        const nextToken = tokens[j];
        if (nextToken.type === "parenthesis") {
          if (nextToken.value === "(") depth++;
          else if (nextToken.value === ")") depth--;
        }
        j++;
      }

      if (depth === 0) {
        result.push({
          type: "nodes",
          value: parseHierarchy(tokens.slice(i + 1, j - 1)),
        });
        i = j - 1;
      }
    } else if (token.type !== "parenthesis") {
      result.push(token);
    }
  }

  return result;
}

/**
 * Convert hierarchy nodes to reverse Polish notation
 * @param nodes - Array of hierarchy nodes
 * @returns Array of nodes in reverse Polish notation
 */
function convertToReversePolish(nodes: HierarchyNode[]): Node[] {
  const result: Node[] = [];
  const pendingOperators: OperatorNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type === "letter") {
      result.push(node);
    } else if (node.type === "sign") {
      // Handle negation operator
      i++;
      const nextNode = nodes[i];
      if (nextNode) {
        result.push(...convertToReversePolish([nextNode]));
        result.push({ type: "letter", value: "1" }, { type: "operator", value: "^" });
      }
    } else if (node.type === "operator") {
      // Process pending operators with higher or equal priority
      while (
        pendingOperators.length > 0 &&
        OPERATOR_PRIORITY[pendingOperators[pendingOperators.length - 1].value] <= OPERATOR_PRIORITY[node.value]
      ) {
        result.push(pendingOperators.pop()!);
      }
      pendingOperators.push(node);
    } else if (node.type === "nodes") {
      result.push(...convertToReversePolish(node.value));
    }
  }

  // Add remaining operators
  while (pendingOperators.length > 0) {
    result.push(pendingOperators.pop()!);
  }

  return result;
}
