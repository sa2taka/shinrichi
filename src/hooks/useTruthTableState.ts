import { useCallback, useReducer } from "react";
import { TruthTableGenerator } from "../libs/truthTableGenerator";

interface TruthTableState {
  generator: TruthTableGenerator;
  inputCount: number;
  outputs: string[];
}

type TruthTableAction =
  | { type: "ADD_INPUT" }
  | { type: "REMOVE_INPUT" }
  | { type: "UPDATE_OUTPUT"; index: number; expression: string }
  | { type: "ADD_OUTPUT"; expression: string }
  | { type: "REMOVE_OUTPUT"; index: number }
  | { type: "SET_INPUT_COUNT"; count: number }
  | { type: "SET_OUTPUTS"; outputs: string[] };

function truthTableReducer(state: TruthTableState, action: TruthTableAction): TruthTableState {
  switch (action.type) {
    case "ADD_INPUT": {
      const newInputCount = Math.min(state.inputCount + 1, 10);
      if (newInputCount === state.inputCount) return state;

      return {
        ...state,
        inputCount: newInputCount,
        generator: new TruthTableGenerator(newInputCount, state.outputs),
      };
    }

    case "REMOVE_INPUT": {
      const newInputCount = Math.max(state.inputCount - 1, 1);
      if (newInputCount === state.inputCount) return state;

      return {
        ...state,
        inputCount: newInputCount,
        generator: new TruthTableGenerator(newInputCount, state.outputs),
      };
    }

    case "UPDATE_OUTPUT": {
      const newOutputs = [...state.outputs];
      if (action.index >= 0 && action.index < newOutputs.length) {
        newOutputs[action.index] = action.expression;
        return {
          ...state,
          outputs: newOutputs,
          generator: new TruthTableGenerator(state.inputCount, newOutputs),
        };
      }
      return state;
    }

    case "ADD_OUTPUT": {
      const newOutputs = [...state.outputs, action.expression];
      return {
        ...state,
        outputs: newOutputs,
        generator: new TruthTableGenerator(state.inputCount, newOutputs),
      };
    }

    case "REMOVE_OUTPUT": {
      const newOutputs = state.outputs.filter((_, index) => index !== action.index);
      if (newOutputs.length === 0) {
        newOutputs.push(""); // 最低1つの出力は保持
      }
      return {
        ...state,
        outputs: newOutputs,
        generator: new TruthTableGenerator(state.inputCount, newOutputs),
      };
    }

    case "SET_INPUT_COUNT": {
      const newInputCount = Math.max(1, Math.min(action.count, 10));
      return {
        ...state,
        inputCount: newInputCount,
        generator: new TruthTableGenerator(newInputCount, state.outputs),
      };
    }

    case "SET_OUTPUTS": {
      const validOutputs = action.outputs.length > 0 ? action.outputs : [""];
      return {
        ...state,
        outputs: validOutputs,
        generator: new TruthTableGenerator(state.inputCount, validOutputs),
      };
    }

    default:
      return state;
  }
}

function createInitialState(inputCount = 2, outputs = ["p | q", "!p & q", "p ^ q"]): TruthTableState {
  return {
    inputCount,
    outputs,
    generator: new TruthTableGenerator(inputCount, outputs),
  };
}

export function useTruthTableState(initialInputCount = 2, initialOutputs = ["p | q", "!p & q", "p ^ q"]) {
  const [state, dispatch] = useReducer(truthTableReducer, createInitialState(initialInputCount, initialOutputs));

  const addInput = useCallback(() => {
    dispatch({ type: "ADD_INPUT" });
  }, []);

  const removeInput = useCallback(() => {
    dispatch({ type: "REMOVE_INPUT" });
  }, []);

  const updateOutput = useCallback((index: number, expression: string) => {
    dispatch({ type: "UPDATE_OUTPUT", index, expression });
  }, []);

  const addOutput = useCallback((expression: string) => {
    dispatch({ type: "ADD_OUTPUT", expression });
  }, []);

  const removeOutput = useCallback((index: number) => {
    dispatch({ type: "REMOVE_OUTPUT", index });
  }, []);

  const setInputCount = useCallback((count: number) => {
    dispatch({ type: "SET_INPUT_COUNT", count });
  }, []);

  const setOutputs = useCallback((outputs: string[]) => {
    dispatch({ type: "SET_OUTPUTS", outputs });
  }, []);

  return {
    generator: state.generator,
    inputCount: state.inputCount,
    outputs: state.outputs,
    actions: {
      addInput,
      removeInput,
      updateOutput,
      addOutput,
      removeOutput,
      setInputCount,
      setOutputs,
    },
  };
}
