import { useCallback, useEffect, useState } from "react";
import { quizzes_attempt_get, quizzes_attempt_save } from "../api";
import type { QuizzesAttemptGetResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

/** Quiz Taking (Student) (/student/quizzes/{id}/attempt): answer, save, and submit the quiz. */
export function SCREEN014() {
  const quizId = useRouteId();
  const [data, setData] = useState<QuizzesAttemptGetResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const response = await quizzes_attempt_get(quizId);
      setData(response);
      const next: Record<string, string> = {};
      for (const answer of response.attempt?.answers ?? []) {
        if (answer.questionId && answer.optionId) next[answer.questionId] = answer.optionId;
      }
      setAnswers(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the quiz.");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(submit: boolean) {
    setSaving(true);
    setError(null);
    setNotice(null);
    const questions = data?.quiz.questions ?? [];
    const payload = {
      answers: questions
        .filter((question) => answers[question.id])
        .map((question) => ({ questionId: question.id, optionId: answers[question.id] })),
      submit,
    };
    try {
      await quizzes_attempt_save(quizId, payload);
      if (submit) {
        setNotice("Quiz submitted.");
        await load();
      } else {
        setNotice("Progress saved.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your attempt.");
    } finally {
      setSaving(false);
    }
  }

  const quiz = data?.quiz;
  const questions = quiz?.questions ?? [];
  const submitted = data?.attempt?.status === "submitted";
  const feedback = data?.attempt?.perQuestion ?? [];
  const score = data?.attempt?.score;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{quiz ? quiz.title : "Quiz"}</h1>
        {quiz ? (
          <p className="mt-1 text-sm text-slate-500">Closes {new Date(quiz.closesAt).toLocaleString()}</p>
        ) : null}
      </header>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading the quiz…</span>
        </div>
      ) : error && !data ? (
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
            Try again
          </button>
        </Card>
      ) : questions.length === 0 ? (
        <EmptyState>This quiz has no questions yet.</EmptyState>
      ) : (
        <>
          {submitted ? (
            <Card className="mb-6">
              <SuccessMessage>
                You submitted this quiz{typeof score === "number" ? ` — score ${score}` : ""}.
              </SuccessMessage>
            </Card>
          ) : null}

          <ol className="space-y-4">
            {questions.map((question, index) => {
              const perQuestion = feedback.find((item) => item.questionId === question.id);
              return (
                <li key={question.id}>
                  <Card className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-sm font-semibold text-slate-900">
                        {index + 1}. {question.prompt}
                      </h2>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {question.points} pt{question.points === 1 ? "" : "s"}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {question.options.map((option) => (
                        <li key={option.id}>
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name={"question-" + question.id}
                              value={option.id}
                              disabled={submitted}
                              checked={answers[question.id] === option.id}
                              onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                            />
                            <span>{option.text}</span>
                            {submitted && perQuestion && perQuestion.correctOptionId === option.id ? (
                              <span className="ok text-xs font-semibold">correct</span>
                            ) : null}
                            {submitted && perQuestion && perQuestion.chosenOptionId === option.id && !perQuestion.isCorrect ? (
                              <span className="error text-xs font-semibold">your answer</span>
                            ) : null}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </li>
              );
            })}
          </ol>

          {!submitted ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className={primaryClasses} disabled={saving} onClick={() => void handleSave(true)}>
                {saving ? "Working…" : "Submit quiz"}
              </button>
              <button type="button" className={ghostClasses} disabled={saving} onClick={() => void handleSave(false)}>
                Save progress
              </button>
            </div>
          ) : (
            <button type="button" className={ghostClasses + " mt-6"} onClick={() => void load()}>
              Back to my attempt
            </button>
          )}
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          {notice && !submitted ? <SuccessMessage>{notice}</SuccessMessage> : null}
        </>
      )}
    </main>
  );
}
