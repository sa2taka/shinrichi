type OperationType = {
  type: 'operator';
  value: '&' | '|' | '^';
};

type SignType = {
  type: 'sign';
  value: '!';
};

type LetterType = {
  type: 'letter';
  value: string;
};

export type Node = OperationType | LetterType;

type TokenNode =
  | Node
  | SignType
  | {
      type: 'parenthesis';
      value: '(' | ')';
    };

type HierarchyNode =
  | Node
  | SignType
  | {
      type: 'nodes';
      value: HierarchyNode[];
    };

const priority = {
  '&': 1,
  '|': 2,
  '^': 3,
} as const;

export function generateReversePolish(exp: string) {
  const nodes = dividedNode(exp);
  const hierarchy = parseHierarchy(nodes);
  return convertReversePolish(hierarchy);
}

function parseHierarchy(nodes: TokenNode[]) {
  const result: HierarchyNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'parenthesis' && node.value === '(') {
      let hierarchy = 1;

      for (let j = i + 1; j < nodes.length; j++) {
        const pNode = nodes[j];
        if (pNode.type === 'parenthesis' && pNode.value === '(') {
          hierarchy += 1;
        }
        if (pNode.type === 'parenthesis' && pNode.value === ')') {
          hierarchy -= 1;
          if (hierarchy === 0) {
            result.push({
              type: 'nodes',
              value: parseHierarchy(nodes.slice(i + 1, j)),
            });
            i = j;
            break;
          }
        }
      }
    } else if (node.type !== 'parenthesis') {
      result.push(node);
    }
  }
  return result;
}

function convertReversePolish(nodes: HierarchyNode[]) {
  const result: Node[] = [];
  let lowPriorityOperators: OperationType[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'letter') {
      result.push(node);
    }

    if (node.type === 'sign') {
      i += 1;
      const nextNode = nodes[i];
      if (nextNode) {
        result.push(...convertReversePolish([nextNode]));
        result.push(
          { type: 'letter', value: '1' },
          { type: 'operator', value: '^' }
        );
      }
    }

    if (node.type === 'operator') {
      let nextOperator: '&' | '|' | '^' | 'end' = 'end';

      let nextNodes = [];
      i += 1;
      for (i; i < nodes.length; i++) {
        const nextNode = nodes[i];
        if (nextNode.type === 'operator') {
          nextOperator = node.value;
          break;
        } else {
          nextNodes.push(nextNode);
        }
      }

      result.push(...convertReversePolish(nextNodes));

      if (nextOperator === 'end') {
        result.push(node);
      } else {
        const highPriorities = lowPriorityOperators.filter(
          (opr) => priority[opr.value] <= priority[node.value]
        );
        lowPriorityOperators = lowPriorityOperators.filter(
          (opr) => priority[opr.value] > priority[node.value]
        );
        result.push(
          ...highPriorities.sort(
            (a, b) => priority[a.value] - priority[b.value]
          )
        );

        const nowPriority = priority[node.value];
        const nextPriority = priority[nextOperator];
        if (nowPriority > nextPriority) {
          lowPriorityOperators.push(node);
        } else {
          result.push(node);
        }
      }
    }

    if (node.type === 'nodes') {
      result.push(...convertReversePolish(node.value));
    }
  }
  return result;
}

function dividedNode(exp: string) {
  let prevValue = '';
  const result: TokenNode[] = [];

  exp.split('').forEach((chr) => {
    if (chr === ' ') {
      return;
    }
    if (chr === '&' || chr === '|' || chr === '^') {
      if (prevValue != '') {
        result.push({ type: 'letter', value: prevValue });
        prevValue = '';
      }
      result.push({
        type: 'operator',
        value: chr,
      });
    } else if (chr === '(' || chr === ')') {
      if (prevValue != '') {
        result.push({ type: 'letter', value: prevValue });
        prevValue = '';
      }
      result.push({
        type: 'parenthesis',
        value: chr,
      });
    } else if (chr === '!') {
      if (prevValue != '') {
        result.push({ type: 'letter', value: prevValue });
        prevValue = '';
      }
      result.push({
        type: 'sign',
        value: chr,
      });
    } else {
      prevValue += chr;
    }
  });

  if (prevValue != '') {
    result.push({ type: 'letter', value: prevValue });
  }

  return result;
}
