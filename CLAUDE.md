# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern truth table generator application built with React 19 and TypeScript. It allows users to input logical expressions and automatically generates corresponding truth tables with real-time calculation.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run lint` - Run ESLint for code quality checking
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build locally

Note: Tests are written but no test command is configured in package.json. Test files use Jest/Vitest patterns.

## Architecture Overview

### Core Logic Layer (`src/libs/`)

The heart of the application consists of three key modules:

1. **`truthTableGenerator.ts`** - Main class that orchestrates truth table generation
   - Manages input variables (p, q, r, s, etc.) with prime notation support (p', q', etc.)
   - Handles dynamic addition/removal of inputs and outputs
   - Calculates truth values for all possible input combinations

2. **`reversePolish.ts`** - Expression parser and evaluator
   - Converts infix logical expressions to reverse Polish notation
   - Handles operator precedence: `&` (AND), `|` (OR), `^` (XOR), `!` (NOT), `()` (parentheses)
   - Supports complex nested expressions with proper parsing

3. **`types.ts`** - TypeScript definitions for the entire system
   - Defines AST node types for expression parsing
   - Specifies truth table column interfaces
   - Contains operator priority mappings

### React Layer

1. **State Management** (`src/hooks/useTruthTableState.ts`)
   - Uses `useReducer` pattern for complex state management
   - Actions: ADD_INPUT, REMOVE_INPUT, UPDATE_OUTPUT, ADD_OUTPUT, REMOVE_OUTPUT
   - Maintains immutable state with automatic re-generation of truth tables

2. **UI Components** (`src/components/TruthTable.tsx`)
   - Main truth table display component
   - Editable headers for output expressions (double-click to edit)
   - Dynamic input/output column management
   - Responsive design with mobile support

### Key Concepts

**Expression Evaluation Engine:**
- Expressions are tokenized, parsed into hierarchical structure, then converted to reverse Polish notation
- Evaluation happens for each row of the truth table by processing the RPN stack
- Supports all standard logical operators with proper precedence

**Dynamic Variable System:**
- Variables are automatically assigned (p, q, r, s, ...)
- Prime notation extends variables (p', q', r', ...) for more than 11 inputs
- Maximum 10 input variables supported for performance reasons

**State Management Pattern:**
- Immutable updates using useReducer
- Each state change recreates TruthTableGenerator instance
- Real-time recalculation of all truth values

## Logical Operators Supported

- `&` - AND (highest precedence: 1)
- `|` - OR (medium precedence: 2) 
- `^` - XOR (lowest precedence: 3)
- `!` - NOT (unary operator, converted to XOR with 1)
- `()` - Parentheses for grouping

## Testing Patterns

Test files are located in `src/libs/__tests__/` and follow these patterns:
- Unit tests for core logic functions
- Truth table validation tests with expected boolean arrays
- Edge case testing for expression parsing and evaluation

## References Directory

The `references/` directory contains the original 2021 implementation for comparison and reference. This modern version maintains the same core logic while using contemporary React patterns and improved TypeScript typing.

## Code Quality

- ESLint enforces TypeScript-aware rules
- Prettier handles code formatting with import organization
- Strict TypeScript configuration with `verbatimModuleSyntax` enabled
- Type-only imports used where appropriate