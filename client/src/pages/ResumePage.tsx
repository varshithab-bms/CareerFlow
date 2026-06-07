import { useState, useEffect } from "react";
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
      showToast("Failed to analyze resume", "error");
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
    <AppLayout title="Resume Enhancer">
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Panel: History */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-card flex flex-col h-[calc(100vh-12rem)] sticky top-24">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Past Resumes</h3>
          
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
                      className={`text-sm text-slate-700 p-3 rounded-lg border cursor-pointer transition ${resume?.id === item.id ? "bg-brand-soft border-brand/30" : "bg-slate-50 border-slate-100 hover:bg-slate-100"}`} 
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
              <p className="text-sm text-slate-500">No resumes uploaded yet.</p>
            )}
          </div>
          
          <div className="pt-4 mt-4 border-t border-slate-100 shrink-0">
            <button
              onClick={() => {
                setResume(null);
                setJobDescription("");
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              + Upload another resume
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {!resume && !isUploading ? (
            <ResumeUploader onUpload={handleUpload} isUploading={isUploading} />
          ) : (
            <div className="space-y-6">
              {isUploading ? (
                <ResumeAnalysisResult isLoading={true} />
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Tailor for a Specific Job</h3>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition min-h-[100px] resize-y"
                    />

                    <button
                      onClick={handleTailor}
                      disabled={isTailoring}
                      className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isTailoring ? "Tailoring..." : "Tailor Resume"}
                    </button>
                  </div>

                  <ResumeAnalysisResult
                    analysis={resume.analysis?.baseAnalysis || resume.analysis}
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