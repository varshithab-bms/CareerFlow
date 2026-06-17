import type { PrepGenerateResponse } from "../api";

interface PrepPlanSessionsProps {
  plan: PrepGenerateResponse;
}

export function PrepPlanSessions({ plan }: PrepPlanSessionsProps) {
  const formatTopicName = (name: string) =>
    name
      .replace("for this title", "")
      .replace(/\s+/g, " ")
      .trim();

  return (
    <div className="space-y-10">
      {plan.sessions.map((session, si) => (
        <section
          key={`${session.title}-${si}`}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Session Header */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Session {si + 1}
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {session.title}
                </h2>

                {session.durationHint && (
                  <p className="mt-2 text-sm text-slate-600">
                    ⏱ {session.durationHint}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Objectives */}
          {session.objectives && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">
                  Session Goal:
                </span>{" "}
                {session.objectives}
              </p>
            </div>
          )}

          {/* Topics */}
          <ul className="mt-6 space-y-6">
            {session.topics.map((topic, ti) => {
              const searchQuery = `${plan.jobRole} ${topic.name}`;

              return (
                <li
                  key={`${topic.name}-${ti}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* Topic Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {formatTopicName(topic.name)}
                      </h3>

                    </div>

                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                      Topic
                    </span>
                  </div>

                  {/* Video Resources */}
                  {topic.videos.length > 0 ? (
                    <div className="mt-6">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Curated Learning Resources
                      </p>

                      <div className="space-y-3">
                        {topic.videos.map((v) => (
                          <a
                            key={v.videoId ?? v.url}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand hover:bg-white hover:shadow-sm"
                          >
                            <p className="font-medium text-slate-900">
                              {v.title}
                            </p>

                            {v.channelTitle && (
                              <p className="mt-1 text-xs text-slate-500">
                                {v.channelTitle}
                              </p>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Recommended Resources
                      </p>

                      <div className="grid gap-3 md:grid-cols-3">
                        {/* YouTube */}
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                            searchQuery
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-slate-200 p-4 transition hover:border-red-500 hover:shadow-sm"
                        >
                          <p className="font-medium text-slate-900">
                            📺 Video Tutorials
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Watch interview-focused explanations and practical
                            examples.
                          </p>
                        </a>

                        {/* Articles */}
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            searchQuery
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-500 hover:shadow-sm"
                        >
                          <p className="font-medium text-slate-900">
                            📚 Learning Articles
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Read guides, blogs, documentation, and industry
                            best practices.
                          </p>
                        </a>

                        {/* Interview Questions */}
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            `${searchQuery} interview questions`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-slate-200 p-4 transition hover:border-green-500 hover:shadow-sm"
                        >
                          <p className="font-medium text-slate-900">
                            💻 Practice Questions
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Explore commonly asked interview questions and
                            answers.
                          </p>
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}