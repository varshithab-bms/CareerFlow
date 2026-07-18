import { useState, useEffect } from "react";
import axios from "axios";
import { AppLayout } from "../components/AppLayout";
import { ResumeUploader } from "../features/resume/components/ResumeUploader";
import { ResumeAnalysisResult } from "../features/resume/components/ResumeAnalysisResult";
import {
  uploadResume,
  analyzeResume,
  tailorResume,
  getResumeHistory,
  getResumeById,
} from "../features/resume/api";
import { useToast } from "../context/ToastContext";
import { SkeletonText } from "../components/Skeleton";
import { FilePlus2, History, Wand2 } from "lucide-react";

export function ResumePage() {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);

  const [resume, setResume] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState("");
  
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchHistory = () => {
    setIsHistoryLoading(true);
    getResumeHistory()
      .then((data) => {
        setHistory(data);
        setIsHistoryLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsHistoryLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpload = async (file: File, jobTitle: string) => {
    try {
      setIsUploading(true);

      const uploadResult = await uploadResume(file);
      const analysisResult = await analyzeResume(uploadResult.id, jobTitle);

      setResume(analysisResult);
      showToast("Resume analyzed successfully", "success");
      fetchHistory();
    } catch (err) {
      console.error(err);
      const message =
        axios.isAxiosError(err) && err.response?.data?.error?.message
          ? err.response.data.error.message
          : "Failed to analyze resume";
      showToast(message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleHistoryClick = async (id: string) => {
    try {
      setIsUploading(true);
      const fullResume = await getResumeById(id);
      setResume(fullResume);
    } catch (err) {
      console.error(err);
      showToast("Failed to load resume details", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTailor = async () => {
    if (!resume) return;
    if (!jobDescription.trim()) return showToast("Enter job description", "error");

    try {
      setIsTailoring(true);

      const result = await tailorResume(resume.id, jobDescription);

      setResume(result);
      showToast("Resume tailored successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to tailor resume", "error");
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="text-sm font-semibold text-brand">Resume Analyzer</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Turn your resume into interview momentum.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Upload, analyze, tailor, and revisit prior resume feedback from one focused workspace.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <aside className="soft-panel flex max-h-[32rem] flex-col p-5 lg:sticky lg:top-24 lg:col-span-1 lg:h-[calc(100vh-12rem)] lg:max-h-none">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              <h3 className="text-lg font-bold text-slate-950">Past resumes</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {history.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 pr-2">
            {isHistoryLoading ? (
              <SkeletonText lines={3} />
            ) : history.length > 0 ? (
              <ul className="space-y-3">
                {history.map((item, i) => {
                  const score = item.analysis?.atsScore || item.analysis?.baseAnalysis?.atsScore || 0;
                  const scoreColor = score >= 80 ? "bg-emerald-100 text-emerald-800" : score >= 60 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800";
                  
                  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today";

                  return (
                    <li 
                      key={item.id || i} 
                      className={`cursor-pointer rounded-xl border p-3 text-sm text-slate-700 transition ${resume?.id === item.id ? "border-brand/30 bg-brand-soft" : "border-slate-100 bg-slate-50 hover:bg-slate-100"}`} 
                      onClick={() => handleHistoryClick(item.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-slate-900 truncate" title={item.fileName}>{item.fileName || "Untitled Resume"}</div>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${scoreColor}`}>
                          {score}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{date}</div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <FilePlus2 className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-semibold text-slate-700">No resumes yet</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your analyses will appear here for quick review.
                </p>
              </div>
            )}
          </div>
          
          <div className="pt-4 mt-4 border-t border-slate-100 shrink-0">
            <button
              onClick={() => {
                setResume(null);
                setJobDescription("");
              }}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FilePlus2 className="h-4 w-4" />
              Upload another resume
            </button>
          </div>
        </aside>

        <div className="lg:col-span-2">
          {!resume && !isUploading ? (
            <ResumeUploader onUpload={handleUpload} isUploading={isUploading} />
          ) : (
            <div className="space-y-6">
              {isUploading ? (
                <ResumeAnalysisResult isLoading={true} />
              ) : (
                <>
                  <div className="soft-panel p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl border border-amber-100 bg-amber-50 p-2 text-amber-700">
                        <Wand2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">Tailor for a specific job</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Paste a job description to get role-specific positioning suggestions.
                        </p>
                      </div>
                    </div>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      className="focus-ring mt-5 min-h-[120px] w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand"
                    />

                    <button
                      onClick={handleTailor}
                      disabled={isTailoring}
                      className="focus-ring mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Wand2 className="h-4 w-4" />
                      {isTailoring ? "Tailoring..." : "Tailor resume"}
                    </button>
                  </div>

                  <ResumeAnalysisResult
                    analysis={{
                      ...(resume.analysis?.baseAnalysis || resume.analysis),
                      ...(resume.analysis?.tailored || {}),
                      jobDescription:
                        resume.analysis?.jobDescription || resume.analysis?.tailored?.jobDescription,
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
