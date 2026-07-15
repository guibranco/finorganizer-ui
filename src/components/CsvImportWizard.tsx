import React, { useState, useRef } from "react";
import { Upload, X, ArrowRight, Table, Check, Info } from "lucide-react";
import { useAccounts, useImportTransactions } from "../api/queries";
import { useToast } from "./Toast";
import { formatCurrency } from "../utils/format";

interface CsvImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportWizard: React.FC<CsvImportWizardProps> = ({ isOpen, onClose }) => {
  const { data: accounts = [] } = useAccounts();
  const importMutation = useImportTransactions();
  const { showToast } = useToast();

  const [accountId, setAccountId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Map columns, 3: Preview

  // Parse state
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!accountId) {
      showToast("Please select a target account first.", "warning");
      return;
    }
    if (!file.name.endsWith(".csv")) {
      showToast("Only CSV files are supported.", "error");
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      
      if (lines.length === 0) {
        showToast("The uploaded CSV file is empty.", "error");
        return;
      }

      // Simple CSV Parse (handles commas, ignores quotes for simplicity but keeps it readable)
      const parsedLines = lines.map(line => {
        // basic comma splitting (handles simple cases perfectly)
        return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
      });

      const csvHeaders = parsedLines[0];
      const csvRows = parsedLines.slice(1);

      setHeaders(csvHeaders);
      setRawRows(csvRows);
      
      // Auto-guessing columns
      const guessed: Record<string, string> = { date: "", description: "", category: "", amount: "", type: "" };
      csvHeaders.forEach((h) => {
        const lower = h.toLowerCase();
        if (lower.includes("date")) guessed.date = h;
        else if (lower.includes("desc") || lower.includes("payee")) guessed.description = h;
        else if (lower.includes("cat")) guessed.category = h;
        else if (lower.includes("amount") || lower.includes("value")) guessed.amount = h;
        else if (lower.includes("type")) guessed.type = h;
      });

      setMappings(guessed);
      setStep(2);
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (field: string, value: string) => {
    setMappings((prev) => ({ ...prev, [field]: value }));
  };

  // Convert mapped columns to real JSON transaction list
  const getMappedRows = () => {
    const dateIdx = headers.indexOf(mappings.date);
    const descIdx = headers.indexOf(mappings.description);
    const catIdx = headers.indexOf(mappings.category);
    const amtIdx = headers.indexOf(mappings.amount);
    const typeIdx = headers.indexOf(mappings.type);

    return rawRows.map((row) => {
      let amt = parseFloat(row[amtIdx] || "0");
      if (isNaN(amt)) amt = 0;

      // Guess type if type column isn't mapped
      let type = "Expense";
      if (typeIdx !== -1) {
        const cell = row[typeIdx]?.toLowerCase();
        if (cell && (cell.includes("in") || cell.includes("credit") || cell.includes("deposit"))) {
          type = "Income";
        }
      } else {
        // If amount is positive, could be Income
        if (amt > 0 && row[descIdx]?.toLowerCase().includes("salary")) {
          type = "Income";
        }
      }

      return {
        Date: row[dateIdx] || new Date().toISOString().split("T")[0],
        Description: row[descIdx] || "Imported item",
        Category: row[catIdx] || "Groceries",
        Type: type,
        Amount: Math.abs(amt),
      };
    });
  };

  const handleCommit = () => {
    const rows = getMappedRows();
    importMutation.mutate(
      { accountId, rows },
      {
        onSuccess: (count) => {
          showToast(`Successfully imported ${count} transactions!`, "success");
          onClose();
        },
        onError: () => {
          showToast("Failed to import transactions from CSV.", "error");
        },
      }
    );
  };

  const activeAccount = accounts.find((a) => a.id === accountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            CSV Import Wizard
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-around px-6 py-4 bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-slate-500 font-mono">
          <span className={step >= 1 ? "text-indigo-400" : ""}>1. Upload CSV</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span className={step >= 2 ? "text-indigo-400" : ""}>2. Map Columns</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span className={step >= 3 ? "text-indigo-400" : ""}>3. Preview & Commit</span>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Select target account */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Target Account for Import</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select recipient account...</option>
                  {accounts.filter(a => !a.isArchived).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag n Drop Stage */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-500/[0.03]" 
                    : "border-slate-800 hover:border-slate-700 bg-slate-950/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 mb-4">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Drag and drop your bank CSV file here</h4>
                <p className="text-xs text-slate-500 mt-2">or click to browse your desktop files (supports .csv format)</p>
              </div>
            </div>
          )}

          {/* STEP 2: MAP COLUMNS */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex gap-3 text-xs text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>We found <b>{headers.length} columns</b> in your file. Please map them to the ledger fields below so we parse the transactions correctly.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Mappings */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date Column</label>
                  <select
                    value={mappings.date}
                    onChange={(e) => handleMappingChange("date", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="">Select column...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description / Payee Column</label>
                  <select
                    value={mappings.description}
                    onChange={(e) => handleMappingChange("description", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="">Select column...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Amount Column</label>
                  <select
                    value={mappings.amount}
                    onChange={(e) => handleMappingChange("amount", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="">Select column...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category Column (Optional)</label>
                  <select
                    value={mappings.category}
                    onChange={(e) => handleMappingChange("category", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="">Select column...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Type Column (Optional)</label>
                  <select
                    value={mappings.type}
                    onChange={(e) => handleMappingChange("type", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="">Auto-guess by values</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & COMMIT */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Account: <b className="text-slate-200">{activeAccount?.name}</b></span>
                <span>Rows parsed: <b className="text-indigo-400">{rawRows.length}</b></span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="p-3">Date</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {getMappedRows().slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-950/30">
                        <td className="p-3 font-mono text-slate-400">{row.Date}</td>
                        <td className="p-3 font-medium text-slate-200">{row.Description}</td>
                        <td className="p-3">
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{row.Category}</span>
                        </td>
                        <td className={`p-3 font-semibold ${row.Type === "Income" ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.Type}
                        </td>
                        <td className="p-3 text-right font-bold font-mono text-slate-200">
                          {formatCurrency(row.Amount, activeAccount?.currency || "EUR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rawRows.length > 10 && (
                  <div className="bg-slate-950 p-2.5 text-center text-[10px] text-slate-500 border-t border-slate-800">
                    Showing first 10 rows. Total of {rawRows.length} items will be imported.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-950/20">
          <button
            onClick={() => {
              if (step === 1) onClose();
              else setStep((prev) => prev - 1);
            }}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step === 2 && (
            <button
              onClick={() => {
                if (!mappings.date || !mappings.description || !mappings.amount) {
                  showToast("Please map at least Date, Description, and Amount.", "error");
                  return;
                }
                setStep(3);
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
            >
              Preview Mapping
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleCommit}
              disabled={importMutation.isPending}
              className="flex items-center gap-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-emerald-500/10"
            >
              <Check className="w-4 h-4" />
              {importMutation.isPending ? "Importing..." : "Confirm & Import"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
