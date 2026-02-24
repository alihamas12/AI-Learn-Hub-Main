import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function QuizPlayer({ quiz, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectAnswer = (questionIndex, answerIndex) => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check all questions are answered
    const unanswered = quiz.questions.findIndex((_, i) => selectedAnswers[i] === undefined);
    if (unanswered !== -1) {
      toast.error(`Please answer all questions (Question ${unanswered + 1} is unanswered)`);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const answers = quiz.questions.map((_, i) => selectedAnswers[i]);
      const response = await axios.post(`${API}/quizzes/${quiz.id}/submit`, answers, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult(response.data);
      setSubmitted(true);

      if (response.data.score >= 70) {
        toast.success(`Great job! You scored ${response.data.score}%`);
      } else {
        toast.info(`You scored ${response.data.score}%. Keep practicing!`);
      }

      if (onComplete) {
        onComplete(response.data.score);
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const question = quiz.questions[currentQuestion];

  if (submitted && result) {
    return (
      <div className="quiz-results" data-testid="quiz-results">
        <div className="results-header">
          {result.score >= 70 ? (
            <CheckCircle className="result-icon success" size={64} />
          ) : (
            <XCircle className="result-icon warning" size={64} />
          )}
          <h2>Quiz Complete!</h2>
          <div className="score-display">
            <span className="score-number">{result.score}%</span>
            <p>You got {result.correct} out of {result.total} questions correct</p>
          </div>
        </div>

        {result.score < 70 && (
          <p className="retry-message">Keep learning and try again to improve your score!</p>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-player" data-testid="quiz-player">
      <div className="quiz-header">
        <h3>{quiz.title}</h3>
        <div className="quiz-progress">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
      </div>

      <Card className="question-card">
        <div className="question-text">
          <h4>Question {currentQuestion + 1}</h4>
          <p>{question.question}</p>
        </div>

        <div className="answer-options">
          {question.options.map((option, index) => (
            <button
              key={index}
              data-testid={`answer-option-${index}`}
              className={`answer-option ${selectedAnswers[currentQuestion] === index ? 'selected' : ''
                }`}
              onClick={() => handleSelectAnswer(currentQuestion, index)}
              disabled={submitted}
            >
              <div className="option-marker">{String.fromCharCode(65 + index)}</div>
              <div className="option-text">{option}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="quiz-navigation">
        <Button
          data-testid="previous-question-btn"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          Previous
        </Button>

        <div className="question-indicators">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`question-indicator ${index === currentQuestion ? 'active' : ''
                } ${selectedAnswers[index] !== undefined ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
              data-testid={`question-indicator-${index}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <Button
            data-testid="next-question-btn"
            onClick={handleNext}
          >
            Next
          </Button>
        ) : (
          <Button
            data-testid="submit-quiz-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
}