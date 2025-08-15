import { useReducer, useCallback, useMemo } from 'react';
import type { 
  KarnaughMapData, 
  CellValue, 
  MinimizedExpression,
  KarnaughMapMode 
} from '../libs/types';
import { 
  createKarnaughMap, 
  updateKarnaughCell,
  setKarnaughFromTruthTable,
  karnaughToTruthTable 
} from '../libs/karnaughMap';
import { 
  minimizeLogicExpression, 
  updateKarnaughMapWithGroups 
} from '../libs/logicMinimizer';

interface KarnaughMapState {
  mapData: KarnaughMapData;
  mode: KarnaughMapMode;
  minimizedExpression: MinimizedExpression | null;
}

type KarnaughMapAction =
  | { type: 'SET_VARIABLE_COUNT'; count: number }
  | { type: 'UPDATE_CELL'; row: number; col: number; value: CellValue }
  | { type: 'SET_FROM_TRUTH_TABLE'; truthValues: boolean[] }
  | { type: 'CLEAR_MAP' }
  | { type: 'SET_MODE'; mode: KarnaughMapMode }
  | { type: 'MINIMIZE_EXPRESSION' }
  | { type: 'RESET_MAP'; variableCount: number; variables: string[] };

const DEFAULT_VARIABLES = ['A', 'B', 'C', 'D'];

function karnaughMapReducer(
  state: KarnaughMapState, 
  action: KarnaughMapAction
): KarnaughMapState {
  switch (action.type) {
    case 'SET_VARIABLE_COUNT': {
      const count = Math.max(2, Math.min(4, action.count));
      const variables = DEFAULT_VARIABLES.slice(0, count);
      const newMapData = createKarnaughMap(count, variables);
      
      return {
        ...state,
        mapData: newMapData,
        minimizedExpression: null,
      };
    }

    case 'UPDATE_CELL': {
      const newMapData = updateKarnaughCell(
        state.mapData,
        action.row,
        action.col,
        action.value
      );
      
      return {
        ...state,
        mapData: newMapData,
        minimizedExpression: null,
      };
    }

    case 'SET_FROM_TRUTH_TABLE': {
      const newMapData = setKarnaughFromTruthTable(
        state.mapData,
        action.truthValues
      );
      
      return {
        ...state,
        mapData: newMapData,
        minimizedExpression: null,
      };
    }

    case 'CLEAR_MAP': {
      const clearedMapData = { ...state.mapData };
      clearedMapData.cells = state.mapData.cells.map(rowCells =>
        rowCells.map(cell => ({ ...cell, value: 0 as CellValue }))
      );
      clearedMapData.groups = [];
      
      return {
        ...state,
        mapData: clearedMapData,
        minimizedExpression: null,
      };
    }

    case 'SET_MODE': {
      return {
        ...state,
        mode: action.mode,
      };
    }

    case 'MINIMIZE_EXPRESSION': {
      try {
        const minimizedExpression = minimizeLogicExpression(state.mapData);
        const mapDataWithGroups = updateKarnaughMapWithGroups(state.mapData);
        
        return {
          ...state,
          mapData: mapDataWithGroups,
          minimizedExpression,
        };
      } catch (error) {
        console.error('Error minimizing expression:', error);
        return state;
      }
    }

    case 'RESET_MAP': {
      const newMapData = createKarnaughMap(action.variableCount, action.variables);
      
      return {
        ...state,
        mapData: newMapData,
        minimizedExpression: null,
      };
    }

    default:
      return state;
  }
}

function createInitialState(
  variableCount = 3, 
  variables = DEFAULT_VARIABLES.slice(0, 3)
): KarnaughMapState {
  return {
    mapData: createKarnaughMap(variableCount, variables),
    mode: 'sop',
    minimizedExpression: null,
  };
}

export function useKarnaughMapState(
  initialVariableCount = 3,
  initialVariables = DEFAULT_VARIABLES.slice(0, 3)
) {
  const [state, dispatch] = useReducer(
    karnaughMapReducer,
    createInitialState(initialVariableCount, initialVariables)
  );

  const setVariableCount = useCallback((count: number) => {
    dispatch({ type: 'SET_VARIABLE_COUNT', count });
  }, []);

  const updateCell = useCallback((row: number, col: number, value: CellValue) => {
    dispatch({ type: 'UPDATE_CELL', row, col, value });
  }, []);

  const setFromTruthTable = useCallback((truthValues: boolean[]) => {
    dispatch({ type: 'SET_FROM_TRUTH_TABLE', truthValues });
  }, []);

  const clearMap = useCallback(() => {
    dispatch({ type: 'CLEAR_MAP' });
  }, []);

  const setMode = useCallback((mode: KarnaughMapMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const minimizeExpression = useCallback(() => {
    dispatch({ type: 'MINIMIZE_EXPRESSION' });
  }, []);

  const resetMap = useCallback((variableCount: number, variables: string[]) => {
    dispatch({ type: 'RESET_MAP', variableCount, variables });
  }, []);

  // Toggle cell value (0 -> 1 -> X -> 0)
  const toggleCell = useCallback((row: number, col: number) => {
    const currentValue = state.mapData.cells[row][col].value;
    let newValue: CellValue;
    
    if (currentValue === 0) {
      newValue = 1;
    } else if (currentValue === 1) {
      newValue = 'X';
    } else {
      newValue = 0;
    }
    
    updateCell(row, col, newValue);
  }, [state.mapData.cells, updateCell]);

  // Auto-minimize when map changes
  const autoMinimizedExpression = useMemo(() => {
    try {
      return minimizeLogicExpression(state.mapData);
    } catch (error) {
      console.error('Error auto-minimizing:', error);
      return null;
    }
  }, [state.mapData]);

  // Convert to truth table values
  const truthTableValues = useMemo(() => {
    return karnaughToTruthTable(state.mapData);
  }, [state.mapData]);

  // Get current expression based on mode
  const currentExpression = useMemo(() => {
    const expression = state.minimizedExpression || autoMinimizedExpression;
    if (!expression) return '';
    
    return state.mode === 'sop' ? expression.sop : expression.pos;
  }, [state.minimizedExpression, autoMinimizedExpression, state.mode]);

  return {
    mapData: state.mapData,
    mode: state.mode,
    minimizedExpression: state.minimizedExpression || autoMinimizedExpression,
    currentExpression,
    truthTableValues,
    variableCount: state.mapData.variableCount,
    variables: state.mapData.variables,
    actions: {
      setVariableCount,
      updateCell,
      toggleCell,
      setFromTruthTable,
      clearMap,
      setMode,
      minimizeExpression,
      resetMap,
    },
  };
}