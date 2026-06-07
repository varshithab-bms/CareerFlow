import type { PrepGenerateResponse } from "../api";

interface PrepPlanSessionsProps {
  plan: PrepGenerateResponse;
}

export function PrepPlanSessions({ plan }: PrepPlanSessionsProps) {
  return (
    <div className="space-y-10">
      {plan.sessions.map((session, si) => (
        <section
          key={`${session.title}-${si}`}
          className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                Session {si + 1}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{session.title}</h2>
              {session.durationHint ? (
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Time: </span>
                  {session.durationHint}
                </p>
              ) : null}
            </div>
          </div>
          {session.objectives ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-800">Objectives: </span>
              {session.objectives}
            </p>
          ) : null}

          <ul className="mt-6 space-y-8">
            {session.topics.map((topic, ti) => (
              <li
                key={`${topic.name}-${ti}`}
                className="rounded-xl border border-white bg-white p-5 shadow-card"
              >
                <h3 className="text-lg font-semibold text-slate-900">{topic.name}</h3>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Suggested videos
                  </p>
                  {topic.videos.length > 0 ? (
                    <ul className="mt-3 space-y-3">
                      {topic.videos.map((v) => (
                        <li key={v.videoId ?? v.url}>
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="group inline-flex flex-col gap-0.5 rounded-lg border border-slate-200 bg-surface-muted/50 px-3 py-2 text-sm transition hover:border-brand/40 hover:bg-brand-soft/40"
                          >
                            <span className="font-medium text-brand group-hover:underline">
                              {v.title}
                            </span>
                            {v.channelTitle ? (
                              <span className="text-xs text-slate-500">{v.channelTitle}</span>
                            ) : null}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      {plan.youtubeConfigured
                        ? "No videos matched this query. Try a different role wording or check again later."
                        : "Optional: set YOUTUBE_API_KEY on the server to attach YouTube search results per topic."}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    Query hint: {plan.jobRole} · {topic.name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
