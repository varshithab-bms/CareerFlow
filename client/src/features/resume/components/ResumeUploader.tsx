import { useRef, useState } from "react";
import { FileCheck2, FileSearch, FileUp, Target, X } from "lucide-react";
import { useToast } from "../../../context/ToastContext";

interface ResumeUploaderProps {
  onUpload: (file: File, jobTitle: string) => Promise<void>;
  isUploading: boolean;
}

export function ResumeUploader({ onUpload, isUploading }: ResumeUploaderProps) {
  const { showToast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const isAccepted =
      file.type === "application/pdf" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isAccepted) {
      showToast("Please upload a PDF or DOCX file.", "error");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!jobTitle.trim()) {
      showToast("Please enter a target role first.", "error");
      return;
    }
    if (selectedFile) {
      await onUpload(selectedFile, jobTitle);
      setSelectedFile(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
      <aside className="soft-panel p-6">
        <div className="inline-flex rounded-xl border border-accent/40 bg-accent-soft p-2 text-accent-deep">
          <FileSearch className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          Resume coaching in three steps
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Upload your resume and target role. CareerFlow will score the resume,
          identify gaps, and turn vague bullets into sharper impact statements.
        </p>

        <div className="mt-6 space-y-4">
          {[
            "Upload PDF or DOCX",
            "Choose the role you are targeting",
            "Review strengths, risks, keywords, and rewrites",
          ].map((step, index) => (
            <div key={step} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                {index + 1}
              </div>
              <p className="pt-1 text-sm font-medium text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="soft-panel p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Upload your resume</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Add a target role so the feedback is specific instead of generic.
            </p>
          </div>
          {selectedFile && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <FileCheck2 className="h-3.5 w-3.5" />
              File ready
            </span>
          )}
        </div>

        <div className="mt-6">
          <label htmlFor="jobTitle" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Target className="h-4 w-4 text-brand" />
            Target role
          </label>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Senior Frontend Developer"
            className="focus-ring w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand"
          />
        </div>

        <div
          className={`mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
            dragActive
              ? "border-brand bg-brand-soft/40"
              : "border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-white"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-slate-200">
            <FileUp className="h-7 w-7" />
          </div>
          <p className="max-w-sm text-sm font-semibold text-slate-800">
            {selectedFile ? selectedFile.name : "Drag and drop your resume here"}
          </p>
          <p className="mt-2 text-xs text-slate-500">PDF or DOCX up to 5MB</p>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleChange}
          />

          <div className="mt-5 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            {!selectedFile ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Select file
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="focus-ring rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading ? "Analyzing..." : "Analyze resume"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
