import { BookOpen, Clock3, ExternalLink, FileText, HelpCircle, PlayCircle, Target } from "lucide-react";
import type { PrepGenerateResponse } from "../api";

interface PrepPlanSessionsProps {
  plan: PrepGenerateResponse;
}

export function PrepPlanSessions({ plan }: PrepPlanSessionsProps) {
  const formatTopicName = (name: string) =>
    name.replace("for this title", "").replace(/\s+/g, " ").trim();

  return (
    <div className="space-y-6">
      {plan.sessions.map((session, si) => (
        <section key={`${session.title}-${si}`} className="soft-panel overflow-hidden">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-brand">Session {si + 1}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">{session.title}</h2>
                {session.durationHint && (
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Clock3 className="h-4 w-4 text-slate-400" />
                    {session.durationHint}
                  </p>
                )}
              </div>
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {session.topics.length} topics
              </span>
            </div>

            {session.objectives && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="flex gap-2 text-sm leading-6 text-blue-900">
                  <Target className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{session.objectives}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4 p-5 sm:p-6">
            {session.topics.map((topic, ti) => {
              const topicName = formatTopicName(topic.name);
              const searchQuery = `${plan.jobRole} ${topicName}`;

              return (
                <article key={`${topic.name}-${ti}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Topic {ti + 1}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-950">{topicName}</h3>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand shadow-sm ring-1 ring-slate-200">
                      <BookOpen className="h-3.5 w-3.5" />
                      Practice focus
                    </span>
                  </div>

                  {topic.videos.length > 0 ? (
                    <div className="mt-5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Curated learning resources
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {topic.videos.map((v) => (
                          <a
                            key={v.videoId ?? v.url}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="interactive-card group rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <div className="flex gap-3">
                              <PlayCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-950">
                                  {v.title}
                                </p>
                                {v.channelTitle && (
                                  <p className="mt-1 text-xs text-slate-500">{v.channelTitle}</p>
                                )}
                              </div>
                              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-brand" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <ResourceLink
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
                        icon={PlayCircle}
                        title="Video tutorials"
                        description="Watch explanations and walkthroughs."
                        tone="text-red-600"
                      />
                      <ResourceLink
                        href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
                        icon={FileText}
                        title="Learning articles"
                        description="Read guides, docs, and examples."
                        tone="text-blue-600"
                      />
                      <ResourceLink
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${searchQuery} interview questions`)}`}
                        icon={HelpCircle}
                        title="Practice questions"
                        description="Explore common interview prompts."
                        tone="text-emerald-600"
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function ResourceLink({
  href,
  icon: Icon,
  title,
  description,
  tone,
}: {
  href: string;
  icon: typeof PlayCircle;
  title: string;
  description: string;
  tone: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="interactive-card rounded-xl border border-slate-200 bg-white p-4"
    >
      <Icon className={`h-5 w-5 ${tone}`} />
      <p className="mt-3 text-sm font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </a>
  );
}
