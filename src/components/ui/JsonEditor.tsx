import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";
import type { MouseEvent } from "react";
import { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiClipboard,
  FiCode,
  FiCopy,
  FiRefreshCw,
} from "react-icons/fi";
import Editor from "react-simple-code-editor";
import Button from "./Button";
import CustomAlert from "./CustomAlert";

type JsonEditorAlert = {
  type: "info" | "success" | "error" | "warning";
  message: string;
};

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onPaste?: (value: string) => void;
  error?: string;
  label?: string;
  onReset?: () => void;
};

const JsonEditor = ({
  value,
  onChange,
  onPaste,
  error,
  label = "JSON Auto-Fill",
  onReset,
}: JsonEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [alert, setAlert] = useState<JsonEditorAlert | null>(null);

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setAlert({
        type: "success",
        message: "JSON copied to clipboard",
      });
    } catch (err) {
      setAlert({ type: "error", message: "Failed to copy JSON" });
      console.log(err);
    }
  };

  const handlePaste = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const text = await navigator.clipboard.readText();
      // Use onPaste if provided (applies overwrite/empty filters), otherwise fallback to onChange
      if (onPaste) {
        onPaste(text);
      } else {
        onChange(text);
      }
      setAlert({
        type: "success",
        message: "JSON pasted successfully",
      });
    } catch (err) {
      console.log("Failed to read clipboard", err);
      setAlert({ type: "error", message: "Failed to read clipboard" });
    }
  };

  return (
    <div className="mb-6 theme-card rounded-lg overflow-hidden relative">
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={3000}
        />
      )}
      <div
        className="flex justify-between items-center p-3 theme-bg-elevated cursor-pointer hover:theme-bg-hover transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <label className="text-sm font-medium text-blue-300 flex items-center gap-2 cursor-pointer">
          <FiCode /> {label}
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </label>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              title="Reset JSON"
            >
              <FiRefreshCw size={12} /> Reset
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            title="Copy JSON"
          >
            <FiCopy size={12} /> Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePaste}
            title="Paste JSON"
          >
            <FiClipboard size={12} /> Paste
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-border">
          <div
            className={`rounded border overflow-hidden ${
              error
                ? "border-red-500"
                : "border-border focus-within:border-blue-500"
            }`}
          >
            <Editor
              value={value}
              onValueChange={onChange}
              highlight={(code) => highlight(code, languages.json)}
              padding={15}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                backgroundColor: "#1f2937", // gray-800
                color: "#f8f8f2",
                minHeight: "200px",
              }}
              className="min-h-50"
            />
          </div>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default JsonEditor;
