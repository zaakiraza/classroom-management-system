import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { quizzes_create, quizzes_list, quizzes_results, quizzes_update } from "../api";
import type { QuizzesListResponse, QuizzesResultsResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const inputClasses =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";
const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

interface DraftOption {
  text: string;
  isCorrect: boolean;
}

interface DraftQuestion {
  prompt: string;
  points: string;
  options: DraftOption[];
}

function emptyQuestion(): DraftQuestion {
  return {
    prompt: "",
    points: "1",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  };
}

/** Quizzes & Quiz Builder (Teacher) (/rooms/{id}/quizzes): build, publish, and inspect quizzes. */
export function SCREEN013() {
  const roomId = useRouteId();
  const [items, setItems] = useState<QuizzesListResponse>([]);
  const [results, setResults] = useState<Record<string, QuizzesResultsResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editClosesAt, setEditClosesAt] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const quizzes = await quizzes_list(roomId);
      setItems(quizzes);
      const settled = await Promise.allSettled(quizzes.map((quiz) => quizzes_results(quiz.id)));
      const nextResults: Record<string, QuizzesResultsResponse> = {};
      settled.forEach((outcome, index) => {
        const quiz = quizzes[index];
        if (quiz && outcome.status === "fulfilled") nextResults[quiz.id] = outcome.value;
      });
      setResults(nextResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load quizzes.");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setNotice(null);
    if (!title.trim() || !closesAt) {
      setActionError("Give the quiz a title and a close date.");
      return;
    }
    const payloadQuestions = questions.map((question) => {
      const points = Number(question.points);
      return {
        prompt: question.prompt.trim(),
        points: Number.isFinite(points) && points > 0 ? points : 1,
        options: question.options
          .filter((option) => option.text.trim())
          .map((option) => ({ text: option.text.trim(), isCorrect: option.isCorrect })),
      };
    });
    if (payloadQuestions.some((question) => !question.prompt || question.options.length < 2)) {
      setActionError("Every question needs a prompt and at least two options.");
      return;
    }
    if (payloadQuestions.some((question) => !question.options.some((option) => option.isCorrect))) {
      setActionError("Mark the correct option for every question.");
      return;
    }
    setCreating(true);
    try {
      await quizzes_create(roomId, {
        title: title.trim(),
        closesAt: new Date(closesAt).toISOString(),
        questions: payloadQuestions,
      });
      setNotice("Quiz created — publish it when you are ready.");
      setTitle("");
      setClosesAt("");
      setQuestions([emptyQuestion()]);
      setBuilderOpen(false);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to create the quiz.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit(quizId: string) {
    setActionError(null);
    setNotice(null);
    if (!editTitle.trim() || !editClosesAt) {
      setActionError("Keep a title and a close date on the quiz.");
      return;
    }
    setBusyId(quizId);
    try {
      await quizzes_update(quizId, {
        title: editTitle.trim(),
        closesAt: new Date(editClosesAt).toISOString(),
      });
      setNotice("Quiz updated.");
      setEditingId(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update the quiz.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleTogglePublish(quizId: string, published: boolean) {
    setActionError(null);
    setNotice(null);
    setBusyId(quizId);
    try {
      await quizzes_update(quizId, { publishedAt: published ? null : new Date().toISOString() });
      setNotice(published ? "Quiz unpublished." : "Quiz published — students can take it now.");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to change the quiz.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Quizzes</h1>
          <p className="mt-1 text-sm text-slate-500">Room {roomId} — build, publish, and review quizzes.</p>
        </div>
        <button type="button" className={primaryClasses} onClick={() => setBuilderOpen((open) => !open)}>
          {builderOpen ? "Close builder" : "New quiz"}
        </button>
      </header>

      {builderOpen ? (
        <Card className="mb-8 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Quiz builder</h2>
          <form onSubmit={handleCreate} noValidate className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[14rem] flex-1">
                <label htmlFor="quiz-title" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Title
                </label>
                <input
                  id="quiz-title"
                  className={inputClasses + " mt-1 w-full"}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Chapter 4 check"
                />
              </div>
              <div>
                <label htmlFor="quiz-closes" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Closes
                </label>
                <input
                  id="quiz-closes"
                  type="datetime-local"
                  className={inputClasses + " mt-1"}
                  value={closesAt}
                  onChange={(event) => setClosesAt(event.target.value)}
                />
              </div>
            </div>

            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[12rem] flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Question {questionIndex + 1}
                    </label>
                    <input
                      className={inputClasses + " mt-1 w-full"}
                      value={question.prompt}
                      onChange={(event) =>
                        setQuestions((prev) =>
                          prev.map((item, index) =>
                            index === questionIndex ? { ...item, prompt: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="What does the model do first?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Points</label>
                    <input
                      type="number"
                      min={1}
                      className={inputClasses + " mt-1 w-24"}
                      value={question.points}
                      onChange={(event) =>
                        setQuestions((prev) =>
                          prev.map((item, index) =>
                            index === questionIndex ? { ...item, points: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </div>
                  {questions.length > 1 ? (
                    <button
                      type="button"
                      className={ghostClasses}
                      onClick={() => setQuestions((prev) => prev.filter((_, index) => index !== questionIndex))}
                    >
                      Remove question
                    </button>
                  ) : null}
                </div>
                <ul className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <li key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={"correct-" + questionIndex}
                        checked={option.isCorrect}
                        aria-label={"Correct option " + (optionIndex + 1)}
                        onChange={() =>
                          setQuestions((prev) =>
                            prev.map((item, index) =>
                              index === questionIndex
                                ? {
                                    ...item,
                                    options: item.options.map((candidate, candidateIndex) => ({
                                      ...candidate,
                                      isCorrect: candidateIndex === optionIndex,
                                    })),
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                      <input
                        className={inputClasses + " flex-1"}
                        value={option.text}
                        onChange={(event) =>
                          setQuestions((prev) =>
                            prev.map((item, index) =>
                              index === questionIndex
                                ? {
                                    ...item,
                                    options: item.options.map((candidate, candidateIndex) =>
                                      candidateIndex === optionIndex ? { ...candidate, text: event.target.value } : candidate,
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                        placeholder={"Option " + (optionIndex + 1)}
                      />
                      {question.options.length > 2 ? (
                        <button
                          type="button"
                          className={ghostClasses}
                          aria-label={"Remove option " + (optionIndex + 1)}
                          onClick={() =>
                            setQuestions((prev) =>
                              prev.map((item, index) =>
                                index === questionIndex
                                  ? { ...item, options: item.options.filter((_, candidateIndex) => candidateIndex !== optionIndex) }
                                  : item,
                              ),
                            )
                          }
                        >
                          ✕
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={ghostClasses + " mt-3"}
                  onClick={() =>
                    setQuestions((prev) =>
                      prev.map((item, index) =>
                        index === questionIndex
                          ? { ...item, options: [...item.options, { text: "", isCorrect: false }] }
                          : item,
                      ),
                    )
                  }
                >
                  Add option
                </button>
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={ghostClasses} onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}>
                Add question
              </button>
              <button type="submit" disabled={creating} className={primaryClasses}>
                {creating ? "Creating…" : "Create quiz"}
              </button>
            </div>
            {actionError ? <ErrorMessage>{actionError}</ErrorMessage> : null}
            {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
          </form>
        </Card>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading quizzes…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
            Try again
          </button>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState>No quizzes yet — build the first one above.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {items.map((quiz) => {
            const quizResults = results[quiz.id];
            const attempts = quizResults?.attempts ?? [];
            return (
              <li key={quiz.id}>
                <Card className="p-5">
                  {editingId === quiz.id ? (
                    <div className="space-y-3">
                      <input
                        aria-label="Edit quiz title"
                        className={inputClasses + " w-full"}
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                      />
                      <input
                        aria-label="Edit close date"
                        type="datetime-local"
                        className={inputClasses}
                        value={editClosesAt}
                        onChange={(event) => setEditClosesAt(event.target.value)}
                      />
                      <div className="flex gap-2">
                        <button type="button" className={primaryClasses} disabled={busyId === quiz.id} onClick={() => void handleSaveEdit(quiz.id)}>
                          {busyId === quiz.id ? "Saving…" : "Save changes"}
                        </button>
                        <button type="button" className={ghostClasses} onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900">{quiz.title}</h3>
                          <p className="muted text-xs">
                            Closes {new Date(quiz.closesAt).toLocaleString()} ·{" "}
                            {quiz.publishedAt ? "published" : "draft"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={ghostClasses}
                            onClick={() => {
                              setEditingId(quiz.id);
                              setEditTitle(quiz.title);
                              setEditClosesAt(new Date(quiz.closesAt).toISOString().slice(0, 16));
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={ghostClasses}
                            disabled={busyId === quiz.id}
                            onClick={() => void handleTogglePublish(quiz.id, Boolean(quiz.publishedAt))}
                          >
                            {quiz.publishedAt ? "Unpublish" : "Publish"}
                          </button>
                        </div>
                      </div>
                      <p className="muted mt-3 text-xs">
                        {(quiz.questions ?? []).length} question{(quiz.questions ?? []).length === 1 ? "" : "s"}
                        {attempts.length > 0
                          ? ` · ${attempts.length} attempt${attempts.length === 1 ? "" : "s"} · ${
                              attempts.filter((attempt) => attempt.status === "submitted").length
                            } submitted`
                          : " · no attempts yet"}
                      </p>
                    </>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
