import { useState, useRef } from "react";
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (
      file.type === "application/pdf" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setSelectedFile(file);
    } else {
      showToast("Please upload a PDF or DOCX file.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!jobTitle.trim()) {
      showToast("Please enter a job title first.", "error");
      return;
    }
    if (selectedFile) {
      await onUpload(selectedFile, jobTitle);
      setSelectedFile(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-900">Upload your resume</h2>
      <p className="mt-1 text-sm text-slate-600">
        Upload a PDF or DOCX file to get started with ATS analysis and enhancement suggestions.
      </p>

      <div className="mt-6">
        <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">
          Target Job Title
        </label>
        <input
          type="text"
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Senior Frontend Developer"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
        />
      </div>

      <div
        className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragActive
            ? "border-brand bg-brand-soft/20"
            : "border-slate-300 hover:border-slate-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand mb-4">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="text-center text-sm font-medium text-slate-700">
          {selectedFile ? selectedFile.name : "Drag and drop your resume here"}
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">
          PDF or DOCX up to 5MB
        </p>

        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleChange}
          />
          {!selectedFile && (
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Select file
            </button>
          )}
          {selectedFile && (
            <>
              <button
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? "Uploading..." : "Analyze Resume"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
