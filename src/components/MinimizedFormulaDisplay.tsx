import React, { memo, useCallback } from 'react';
import type { MinimizedExpression, KarnaughMapMode } from '../libs/types';

interface MinimizedFormulaDisplayProps {
  expression: MinimizedExpression | null;
  mode: KarnaughMapMode;
  onModeChange: (mode: KarnaughMapMode) => void;
  onExportToTruthTable?: () => void;
  currentFormula: string;
}

export const MinimizedFormulaDisplay: React.FC<MinimizedFormulaDisplayProps> = ({
  expression,
  mode,
  onModeChange,
  onExportToTruthTable,
  currentFormula,
}) => {
  const handleModeChange = useCallback((newMode: KarnaughMapMode) => {
    onModeChange(newMode);
  }, [onModeChange]);

  const handleExport = useCallback(() => {
    if (onExportToTruthTable) {
      onExportToTruthTable();
    }
  }, [onExportToTruthTable]);

  const renderFormulaWithFormatting = (formula: string) => {
    if (!formula || formula === '0' || formula === '1') {
      return <span className="constant-value">{formula}</span>;
    }

    // Split formula into terms
    const isSOPMode = mode === 'sop';
    const mainSeparator = isSOPMode ? ' | ' : ' & ';
    const terms = formula.split(mainSeparator);

    return (
      <span className="formula">
        {terms.map((term, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="operator main-operator">
                {isSOPMode ? ' | ' : ' & '}
              </span>
            )}
            <span className="term">
              {isSOPMode ? renderSOPTerm(term) : renderPOSTerm(term)}
            </span>
          </React.Fragment>
        ))}
      </span>
    );
  };

  const renderSOPTerm = (term: string) => {
    const literals = term.split(' & ').map(lit => lit.trim());
    return (
      <>
        {literals.map((literal, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="operator">&</span>}
            {literal.startsWith('!') ? (
              <span className="negated-variable">
                <span className="negation">¬</span>
                <span className="variable">{literal.substring(1)}</span>
              </span>
            ) : (
              <span className="variable">{literal}</span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const renderPOSTerm = (term: string) => {
    // POS terms are in parentheses like (A | B | !C)
    const cleanTerm = term.replace(/[()]/g, '');
    const literals = cleanTerm.split(' | ').map(lit => lit.trim());
    
    return (
      <span className="pos-term">
        <span className="parenthesis">(</span>
        {literals.map((literal, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="operator">|</span>}
            {literal.startsWith('!') ? (
              <span className="negated-variable">
                <span className="negation">¬</span>
                <span className="variable">{literal.substring(1)}</span>
              </span>
            ) : (
              <span className="variable">{literal}</span>
            )}
          </React.Fragment>
        ))}
        <span className="parenthesis">)</span>
      </span>
    );
  };

  return (
    <div className="minimized-formula-display">
      <div className="formula-header">
        <h3>最適化された論理式</h3>
        
        <div className="mode-selector">
          <button
            className={`mode-button ${mode === 'sop' ? 'active' : ''}`}
            onClick={() => handleModeChange('sop')}
            title="Sum of Products (積和標準形)"
          >
            SOP
          </button>
          <button
            className={`mode-button ${mode === 'pos' ? 'active' : ''}`}
            onClick={() => handleModeChange('pos')}
            title="Product of Sums (和積標準形)"
          >
            POS
          </button>
        </div>
      </div>

      <div className="formula-content">
        <div className="current-formula">
          <div className="formula-type">
            {mode === 'sop' ? '積和標準形 (SOP)' : '和積標準形 (POS)'}:
          </div>
          <div className="formula-expression">
            {renderFormulaWithFormatting(currentFormula)}
          </div>
        </div>

        {expression && (
          <div className="detailed-info">
            <div className="formula-stats">
              <div className="stat-item">
                <span className="stat-label">項数:</span>
                <span className="stat-value">
                  {mode === 'sop' ? expression.terms.length : expression.terms.length}
                </span>
              </div>
              
              {mode === 'sop' && (
                <div className="stat-item">
                  <span className="stat-label">最小項:</span>
                  <span className="stat-value">
                    m({expression.minterms.join(', ')})
                  </span>
                </div>
              )}
              
              {mode === 'pos' && (
                <div className="stat-item">
                  <span className="stat-label">最大項:</span>
                  <span className="stat-value">
                    M({expression.maxterms.join(', ')})
                  </span>
                </div>
              )}
            </div>

            <div className="alternative-form">
              <div className="alt-formula-type">
                {mode === 'sop' ? '和積標準形 (POS)' : '積和標準形 (SOP)'}:
              </div>
              <div className="alt-formula-expression">
                {renderFormulaWithFormatting(mode === 'sop' ? expression.pos : expression.sop)}
              </div>
            </div>
          </div>
        )}
      </div>

      {onExportToTruthTable && (
        <div className="formula-actions">
          <button
            className="export-button"
            onClick={handleExport}
            title="この論理式を真理値表モードにエクスポート"
          >
            真理値表にエクスポート
          </button>
        </div>
      )}

      <div className="formula-help">
        <h4>記号の説明:</h4>
        <ul>
          <li><strong>¬</strong> または <strong>!</strong>: 否定 (NOT)</li>
          <li><strong>&</strong>: 論理積 (AND)</li>
          <li><strong>|</strong>: 論理和 (OR)</li>
          <li><strong>SOP</strong>: Sum of Products (積和標準形) - OR で結ばれた AND 項</li>
          <li><strong>POS</strong>: Product of Sums (和積標準形) - AND で結ばれた OR 項</li>
        </ul>
      </div>
    </div>
  );
};

export default memo(MinimizedFormulaDisplay);