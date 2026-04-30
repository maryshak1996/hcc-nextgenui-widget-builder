import * as React from 'react';

/** Jest-friendly stub so @patternfly/react-code-editor tests without loading Monaco workers. */
export const loader = { config: () => undefined };

type EditorProps = {
  value?: string;
  language?: string;
  onChange?: (value: string | undefined, event: unknown) => void;
  onMount?: (editor: unknown, monaco: unknown) => void;
};

const fakeEditor = {
  addCommand: () => undefined,
  getContentHeight: () => 200,
  getLayoutInfo: () => ({ width: 400 }),
  layout: () => undefined
};

const MonacoEditor: React.FC<EditorProps> = ({ value, onChange, onMount, language }) => {
  React.useEffect(() => {
    onMount?.(fakeEditor, {});
  }, [onMount, language]);

  return (
    <textarea
      data-testid="monaco-editor-mock"
      aria-label={language ? `code-editor-${language}` : 'code-editor'}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value, {})}
      style={{ width: '100%', minHeight: '8rem', fontFamily: 'monospace' }}
    />
  );
};

export default MonacoEditor;
