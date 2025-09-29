import React, { useState, useEffect, useRef } from 'react'
import { Button, Input, Progress, Modal } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { updateCandidate } from '../store/slices/candidatesSlice'
import { updateSession, endSession } from '../store/slices/sessionSlice'
import questionsDB from '../data/questions'
import { v4 as uuidv4 } from 'uuid'

const difficultyTimers = { easy: 20, medium: 60, hard: 120 }

// simple correctness check: keyword overlap
function checkCorrectness(question, answer) {
  if (!answer || !answer.trim()) return false
  const qWords = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
  const aWords = answer.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
  let matches = 0
  for (let w of aWords) {
    if (qWords.includes(w)) matches++
  }
  return matches >= 2 // at least 2 word overlaps
}

export default function Chat() {
  const dispatch = useDispatch()
  const session = useSelector(s => s.session.current)
  const candidates = useSelector(s => s.candidates.list)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (session && session.questionIndex === 0 && messages.length === 0) {
      startQuestion(0)
    }
    // cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line
  }, [session])

  function startQuestion(idx) {
    const q = questionsDB[idx]
    if (!q) return
    setMessages(m => [...m, { id: uuidv4(), from: 'ai', text: q.text }])
    setQIndex(idx)
    const seconds = difficultyTimers[q.difficulty]
    setTimeLeft(seconds)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          submitAnswer('') // auto-submit empty answer on timeout
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  function submitAnswer(fromUserInput = null) {
    const answerText = fromUserInput !== null ? fromUserInput : input
    setMessages(m => [...m, { id: uuidv4(), from: 'user', text: answerText || '[No answer]' }])
    setInput('')

    const q = questionsDB[qIndex]

    // check correctness
    const correct = checkCorrectness(q.text, answerText)
    let score = 0
    if (correct) {
      let base = Math.min(10, (answerText || '').length / 10)
      let difficultyFactor =
        q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 1.5 : 2
      score = Math.max(0, Math.round((base * 10) / difficultyFactor))
    }

    // save answer
    const answerEntry = {
      questionIndex: qIndex,
      text: answerText || '[No answer]',
      score,
      correct
    }

    const prevAnswers = session?.answers || []
    dispatch(updateSession({ answers: [...prevAnswers, answerEntry] }))

    const candidateId = session?.candidateId
    if (candidateId) {
      const cand = candidates.find(c => c.id === candidateId)
      const prevHistory = cand?.history || []
      dispatch(
        updateCandidate({
          id: candidateId,
          updates: { history: [...prevHistory, answerEntry] }
        })
      )
    }

    if (timerRef.current) clearInterval(timerRef.current)
    const nextIndex = qIndex + 1
    if (nextIndex < questionsDB.length) {
      setTimeout(() => startQuestion(nextIndex), 700)
    } else {
      finishInterview()
    }
  }

  function finishInterview() {
    const answers = session?.answers || []
    const total = answers.reduce((s, a) => s + (a.score || 0), 0)
    const finalScore = answers.length
      ? Math.round(total / answers.length)
      : 0

    const candidateId = session?.candidateId
    if (candidateId) {
      dispatch(updateCandidate({ id: candidateId, updates: { score: finalScore } }))
    }

    Modal.success({ title: 'Interview complete', content: `Final score: ${finalScore}%` })
    dispatch(endSession())
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-medium mb-2">Interview Chat</h3>
      <div className="h-96 overflow-auto p-2 border rounded mb-2">
        {messages.map(m => (
          <div
            key={m.id}
            className={`mb-2 ${m.from === 'ai' ? 'text-left' : 'text-right'}`}
          >
            <div className="inline-block chat-bubble bg-slate-100">
              <div className="text-sm">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      {timeLeft !== null && (
        <div className="mb-2">
          <Progress
            percent={Math.round(
              (timeLeft /
                (difficultyTimers[questionsDB[qIndex]?.difficulty || 'easy'])) *
                100
            )}
          />
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={() => submitAnswer(input)}
          placeholder="Type your answer..."
        />
        <Button onClick={() => submitAnswer(input)} type="primary">
          Submit
        </Button>
      </div>
    </div>
  )
}
