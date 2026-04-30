'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as quizzesService from '@/services/quizzes.service'
import type { Quiz, QuizQuestion } from '@/types/database.types'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [activeQuiz, setActiveQuiz] = useState<{ quiz: Quiz; questions: QuizQuestion[] } | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await quizzesService.getQuizzes()
      if (!cancelled && res.success && res.data) setQuizzes(res.data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const startQuiz = async (id: string) => {
    const res = await quizzesService.getQuiz(id)
    if (res.success && res.data) {
      setActiveQuiz({ quiz: res.data, questions: res.data.questions ?? [] })
      setCurrentQuestion(0)
      setAnswers({})
      setShowResults(false)
    }
  }

  const selectAnswer = (questionId: string, answer: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const submitQuiz = async () => {
    if (!activeQuiz) return

    let earnedScore = 0
    let maxPoints = 0

    for (const q of activeQuiz.questions) {
      maxPoints += q.points
      if (answers[q.id] === q.correct_answer) {
        earnedScore += q.points
      }
    }

    setScore(earnedScore)
    setTotalPoints(maxPoints)

    await quizzesService.submitQuizAttempt(activeQuiz.quiz.id, answers, earnedScore, maxPoints)
    setShowResults(true)
  }

  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
          Practice Quizzes 💡
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Test your knowledge with practice quizzes</p>
      </div>

      {activeQuiz && !showResults ? (
        // Quiz Taking Mode
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button
            onClick={() => setActiveQuiz(null)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: '20px', padding: 0 }}
          >
            ← Back to Quizzes
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              Question {currentQuestion + 1} of {activeQuiz.questions.length}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#FFB300', fontWeight: 600 }}>
              {activeQuiz.questions[currentQuestion].points} pts
            </span>
          </div>

          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '32px' }}>
            <div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #F39C12, #E67E22)', transition: 'width 0.3s', width: `${((currentQuestion + 1) / activeQuiz.questions.length) * 100}%` }} />
          </div>

          <h2 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '24px', lineHeight: 1.5 }}>
            {activeQuiz.questions[currentQuestion].question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeQuiz.questions[currentQuestion].options?.map((opt: Record<string, unknown>, idx: number) => {
              const value = String(opt['value'] ?? opt)
              const label = String(opt['label'] ?? value)
              const isSelected = answers[activeQuiz.questions[currentQuestion].id] === value
              return (
                <motion.button
                  key={idx}
                  onClick={() => selectAnswer(activeQuiz.questions[currentQuestion].id, value)}
                  whileHover={{ x: 4 }}
                  style={{
                    padding: '16px 20px', borderRadius: '12px', textAlign: 'left',
                    background: isSelected ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${isSelected ? '#4169E1' : 'rgba(255,255,255,0.1)'}`,
                    color: 'white', fontSize: '1rem', cursor: 'pointer',
                  }}
                >
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: isSelected ? '#4169E1' : 'rgba(255,255,255,0.1)',
                    marginRight: '12px', fontSize: '0.85rem', fontWeight: 600,
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {label}
                </motion.button>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
              style={{
                padding: '12px 24px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: currentQuestion === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem', cursor: currentQuestion === 0 ? 'default' : 'pointer',
              }}
            >
              Previous
            </button>
            {currentQuestion < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                style={{
                  padding: '12px 24px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
                  color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < activeQuiz.questions.length}
                style={{
                  padding: '12px 24px', borderRadius: '10px', border: 'none',
                  background: Object.keys(answers).length === activeQuiz.questions.length
                    ? 'linear-gradient(135deg, #27AE60, #1E8449)'
                    : 'rgba(255,255,255,0.05)',
                  color: Object.keys(answers).length === activeQuiz.questions.length ? 'white' : 'rgba(255,255,255,0.3)',
                  fontSize: '0.9rem', fontWeight: 600,
                  cursor: Object.keys(answers).length === activeQuiz.questions.length ? 'pointer' : 'default',
                }}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      ) : activeQuiz && showResults ? (
        // Results
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: '160px', height: '160px', borderRadius: '50%',
              background: percentage >= 70 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
              border: `4px solid ${percentage >= 70 ? '#27AE60' : '#E74C3C'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: percentage >= 70 ? '#27AE60' : '#E74C3C' }}>
                {percentage}%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                {score}/{totalPoints} pts
              </div>
            </div>
          </motion.div>
          <h2 style={{ color: 'white', marginBottom: '8px' }}>
            {percentage >= 70 ? '🎉 Great Job!' : '📚 Keep Practicing!'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
            You scored {score} out of {totalPoints} points
          </p>

          {/* Review Answers */}
          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            {activeQuiz.questions.map((q) => {
              const isCorrect = answers[q.id] === q.correct_answer
              return (
                <div key={q.id} style={{ padding: '16px', marginBottom: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${isCorrect ? '#27AE60' : '#E74C3C'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>{isCorrect ? '✅' : '❌'}</span>
                    <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>{q.question}</span>
                  </div>
                  {!isCorrect && (
                    <div style={{ fontSize: '0.8rem', color: '#27AE60' }}>
                      Correct answer: {q.correct_answer}
                    </div>
                  )}
                  {q.explanation && (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setActiveQuiz(null)}
            style={{
              padding: '12px 32px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
              color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Back to Quizzes
          </button>
        </div>
      ) : (
        // Quiz List
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {quizzes.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💡</div>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>No quizzes available yet. Check back soon!</p>
            </div>
          ) : (
            quizzes.map(quiz => (
              <motion.div
                key={quiz.id}
                whileHover={{ y: -4 }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}
              >
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'white', marginBottom: '8px' }}>
                  {quiz.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                  {quiz.description || 'No description'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                    {(quiz as unknown as { question_count?: number }).question_count ?? 0} questions
                  </span>
                  {quiz.time_limit_seconds && (
                    <span style={{ fontSize: '0.8rem', color: '#FFB300' }}>
                      ⏱️ {Math.round(quiz.time_limit_seconds / 60)} min
                    </span>
                  )}
                </div>
                <button
                  onClick={() => startQuiz(quiz.id)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #F39C12, #E67E22)',
                    color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Start Quiz
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
