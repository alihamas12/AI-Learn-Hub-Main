import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navbar from '@/components/Navbar';
import QuizPlayer from '@/components/student/QuizPlayer';
import LiveClassCard from '@/components/student/LiveClassCard';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  MessageSquare,
  X,
  Send,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Download,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CoursePlayer({ user, logout }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentView, setCurrentView] = useState('lesson'); // 'lesson' | 'quiz' | 'live-classes' | 'certificate'
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [passedQuizzes, setPassedQuizzes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showAITutor, setShowAITutor] = useState(false);
  const [tutorMessages, setTutorMessages] = useState([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCourseData();
    }
  }, [id, user]);

  const fetchCourseData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [courseRes, sectionsRes, liveClassesRes, certificatesRes, enrollmentsRes] = await Promise.all([
        axios.get(`${API}/courses/${id}`, { headers }),
        axios.get(`${API}/courses/${id}/sections`, { headers }),
        axios.get(`${API}/courses/${id}/live-classes`, { headers }),
        axios.get(`${API}/certificates/my-certificates`, { headers }),
        axios.get(`${API}/enrollments/my-courses`, { headers })
      ]);

      const fetchedSections = sectionsRes.data;
      setCourse(courseRes.data);
      setSections(fetchedSections);

      // Flatten lessons for navigation
      const allLessons = fetchedSections.flatMap(s => s.lessons || []);
      setLessons(allLessons);

      // Collect passed quizzes
      const passed = new Set();
      fetchedSections.forEach(s => {
        (s.quizzes || []).forEach(q => {
          if (q.passed) passed.add(q.id);
        });
      });
      setPassedQuizzes(passed);

      setLiveClasses(liveClassesRes.data);

      const myCertificates = certificatesRes.data.filter(c => c.course_id === id);
      setCertificates(myCertificates);

      const currentEnrollment = enrollmentsRes.data.find(e => e.course_id === id);
      if (!currentEnrollment) {
        toast.error('You are not enrolled in this course');
        navigate(`/course/${id}`);
        return;
      }

      setEnrollment(currentEnrollment);

      // Load completed lessons from backend (primary source of truth)
      const backendLessons = new Set(currentEnrollment.completed_lessons || []);

      // Also check localStorage for backward compatibility and merge
      const saved = localStorage.getItem(`completed_lessons_${id}`);
      if (saved) {
        const localLessons = JSON.parse(saved);
        localLessons.forEach(lessonId => backendLessons.add(lessonId));
      }

      // Filter out lessons that no longer exist
      const validLessons = new Set(
        [...backendLessons].filter(lessonId => lessonsRes.data.some(l => l.id === lessonId))
      );
      setCompletedLessons(validLessons);

      // Sync progress if it doesn't match actual completed lessons
      const actualProgress = allLessons.length > 0
        ? (validLessons.size / allLessons.length) * 100
        : 0;
      const storedProgress = currentEnrollment.progress || 0;

      // If there's a mismatch (more than 1% difference), sync to backend
      if (Math.abs(actualProgress - storedProgress) > 1) {
        try {
          await axios.patch(
            `${API}/enrollments/${currentEnrollment.id}/progress`,
            null,
            {
              params: {
                progress: actualProgress,
                completed_lessons: JSON.stringify([...validLessons])
              },
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log('Progress synced:', actualProgress);
        } catch (syncError) {
          console.error('Failed to sync progress:', syncError);
        }
      }
    } catch (error) {
      toast.error('Failed to load course');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentLesson = lessons[currentLessonIndex];

  const markLessonComplete = async () => {
    if (!currentLesson) return;

    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson.id);
    setCompletedLessons(newCompleted);

    // Save to localStorage (backup)
    localStorage.setItem(`completed_lessons_${id}`, JSON.stringify([...newCompleted]));

    const token = localStorage.getItem('token');

    // Use the new complete-lesson endpoint for accurate progress calculation
    try {
      const response = await axios.post(
        `${API}/enrollments/${enrollment.id}/complete-lesson`,
        null,
        {
          params: { lesson_id: currentLesson.id },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { progress, certificate_earned, certificate_id } = response.data;

      toast.success('Lesson marked as complete!');

      // If all lessons complete, show congratulations and fetch certificates
      if (progress >= 100) {
        toast.success('🎉 Congratulations! You completed the course!');
        if (certificate_earned) {
          toast.success('Your certificate is ready to download!');
        }

        // Refresh to get certificate
        setTimeout(() => {
          fetchCourseData();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const downloadCertificate = (certificate) => {
    // For now, show certificate info
    // In production, this would generate a PDF or redirect to certificate page
    toast.success('Certificate downloaded!');
    window.open(`/certificate/${certificate.id}`, '_blank');
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const askAITutor = async () => {
    if (!tutorInput.trim()) return;

    const userMessage = { role: 'user', content: tutorInput };
    setTutorMessages([...tutorMessages, userMessage]);
    setTutorInput('');
    setTutorLoading(true);

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${API}/ai/tutor?course_id=${id}&question=${encodeURIComponent(tutorInput)}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const aiMessage = { role: 'assistant', content: response.data.response };
      setTutorMessages([...tutorMessages, userMessage, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
      console.error(error);
    } finally {
      setTutorLoading(false);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={16} />;
      case 'pdf': return <FileText size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  if (loading) return <div className="loading">Loading course...</div>;
  if (!course || lessons.length === 0) return <div className="empty-state">No lessons available</div>;

  const progressPercentage = (completedLessons.size / lessons.length) * 100;

  return (
    <div className="course-player-page" data-testid="course-player">
      <Navbar user={user} logout={logout} />

      <div className="player-container">
        {/* Sidebar - Lessons List */}
        <aside className="lessons-sidebar" data-testid="lessons-sidebar">
          <div className="sidebar-header">
            <h3>{course.title}</h3>
            <div className="progress-info">
              <span>{completedLessons.size} / {lessons.length} completed</span>
              <Progress value={progressPercentage} className="mt-2" />
            </div>

            {/* Certificate Badge */}
            {certificates.length > 0 && (
              <div className="certificate-earned" data-testid="certificate-earned">
                <Award size={20} className="certificate-icon" />
                <span>Certificate Earned!</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentView('certificate')}
                  data-testid="view-certificate-btn"
                >
                  <Download size={16} className="mr-1" />
                  View
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Tabs */}
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${currentView === 'lesson' || currentView === 'quiz-player' ? 'active' : ''}`}
              onClick={() => setCurrentView('lesson')}
              data-testid="lessons-tab"
            >
              <BookOpen size={18} />
              Course Content
            </button>
            <button
              className={`sidebar-tab ${currentView === 'live-classes' ? 'active' : ''}`}
              onClick={() => setCurrentView('live-classes')}
              data-testid="live-classes-tab"
            >
              <Video size={18} />
              Live ({liveClasses.length})
            </button>
          </div>

          <ScrollArea className="lessons-scroll">
            {currentView === 'lesson' && (
              <div className="lessons-list">
                {sections.map((section) => (
                  <div key={section.id} className="section-group">
                    <div className="section-title-sidebar">{section.title}</div>

                    {/* Lessons in section */}
                    {(section.lessons || []).map((lesson) => {
                      const globalIndex = lessons.findIndex(l => l.id === lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          data-testid={`lesson-item-${lesson.id}`}
                          className={`lesson-item ${globalIndex === currentLessonIndex ? 'active' : ''
                            } ${completedLessons.has(lesson.id) ? 'completed' : ''}`}
                          onClick={() => {
                            setCurrentLessonIndex(globalIndex);
                            setCurrentView('lesson');
                          }}
                        >
                          <div className="lesson-status">
                            {completedLessons.has(lesson.id) ? (
                              <CheckCircle className="icon-completed" size={20} />
                            ) : (
                              <Circle className="icon-pending" size={20} />
                            )}
                          </div>
                          <div className="lesson-info">
                            <div className="lesson-title">{lesson.title}</div>
                            <div className="lesson-meta">
                              {getLessonIcon(lesson.type)}
                              <span>{lesson.type}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Quizzes in section */}
                    {(section.quizzes || []).map((quiz) => (
                      <div
                        key={quiz.id}
                        className={`lesson-item quiz-item-sidebar ${selectedQuiz?.id === quiz.id ? 'active' : ''} ${passedQuizzes.has(quiz.id) ? 'completed' : ''}`}
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setCurrentView('quiz-player');
                        }}
                      >
                        <div className="lesson-status">
                          {passedQuizzes.has(quiz.id) ? (
                            <CheckCircle className="icon-completed" size={20} style={{ color: '#10b981' }} />
                          ) : (
                            <HelpCircle className="icon-pending" size={20} style={{ color: '#6366f1' }} />
                          )}
                        </div>
                        <div className="lesson-info text-indigo-600">
                          <div className="lesson-title font-bold">Quiz: {quiz.title}</div>
                          <div className="lesson-meta">
                            <span>{quiz.questions?.length || 0} Questions</span>
                            {quiz.passed && <span className="text-green-600 ml-2">(Passed)</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}


            {currentView === 'live-classes' && (
              <div className="live-classes-list-sidebar">
                {liveClasses.length === 0 ? (
                  <div className="empty-view">No live classes scheduled</div>
                ) : (
                  liveClasses.map((liveClass) => (
                    <LiveClassCard key={liveClass.id} liveClass={liveClass} />
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="player-main" data-testid="player-main">
          {currentView === 'quiz-player' && selectedQuiz ? (
            <div className="quiz-player-container">
              <div className="lesson-header">
                <h2>{selectedQuiz.title}</h2>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentView('lesson');
                    setSelectedQuiz(null);
                  }}
                >
                  Back to Sections
                </Button>
              </div>
              <div className="quiz-player-content">
                <QuizPlayer
                  quiz={selectedQuiz}
                  courseId={id}
                  onComplete={(score) => {
                    toast.success(`Quiz completed! Score: ${score}%`);
                    if (score >= 70) {
                      setPassedQuizzes(prev => new Set([...prev, selectedQuiz.id]));
                      // Optionally refresh course data for certificate
                      fetchCourseData();
                    }
                    setTimeout(() => {
                      setCurrentView('lesson');
                      setSelectedQuiz(null);
                    }, 2000);
                  }}
                />
              </div>
            </div>
          ) : currentView === 'certificate' && certificates.length > 0 ? (
            <div className="certificate-view">
              <div className="certificate-display">
                <Award size={80} className="certificate-main-icon" />
                <h1>Certificate of Completion</h1>
                <h2>{course.title}</h2>
                <p className="recipient-name">{user.name}</p>
                <p className="issue-date">Issued on {new Date(certificates[0].issued_date).toLocaleDateString()}</p>
                <Button
                  size="lg"
                  onClick={() => downloadCertificate(certificates[0])}
                  data-testid="download-certificate-btn"
                >
                  <Download size={20} className="mr-2" />
                  Download Certificate
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="lesson-header">
                <div>
                  <h2 data-testid="current-lesson-title">{currentLesson?.title}</h2>
                  <p className="lesson-type">Lesson {currentLessonIndex + 1} of {lessons.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentLesson?.notes_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(currentLesson.notes_url, '_blank')}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Download size={18} className="mr-2" />
                      Download Notes (PDF)
                    </Button>
                  )}
                  <Button
                    data-testid="ai-tutor-toggle"
                    onClick={() => setShowAITutor(!showAITutor)}
                    variant={showAITutor ? 'default' : 'outline'}
                  >
                    <MessageSquare size={18} className="mr-2" />
                    AI Tutor
                  </Button>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="lesson-content" data-testid="lesson-content">
                {currentLesson?.type === 'video' && (
                  <div className="video-container">
                    {currentLesson.content_url ? (
                      currentLesson.content_url.includes('youtube.com') || currentLesson.content_url.includes('youtu.be') ? (
                        <iframe
                          src={currentLesson.content_url.replace('watch?v=', 'embed/')}
                          title={currentLesson.title}
                          allowFullScreen
                          className="video-iframe"
                        />
                      ) : currentLesson.content_url.includes('vimeo.com') ? (
                        <iframe
                          src={currentLesson.content_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                          title={currentLesson.title}
                          allowFullScreen
                          className="video-iframe"
                        />
                      ) : (
                        <video controls className="video-player">
                          <source src={currentLesson.content_url} />
                        </video>
                      )
                    ) : (
                      <div className="placeholder">Video content will be available soon</div>
                    )}
                  </div>
                )}

                {currentLesson?.type === 'pdf' && (
                  <div className="pdf-container">
                    {currentLesson.content_url ? (
                      <iframe
                        src={currentLesson.content_url}
                        title={currentLesson.title}
                        className="pdf-iframe"
                      />
                    ) : (
                      <div className="placeholder">PDF content will be available soon</div>
                    )}
                  </div>
                )}

                {currentLesson?.type === 'text' && (
                  <div className="text-container">
                    {currentLesson.content_text ? (
                      <div className="text-content" dangerouslySetInnerHTML={{ __html: currentLesson.content_text }} />
                    ) : (
                      <div className="placeholder">Text content will be available soon</div>
                    )}
                  </div>
                )}
              </div>

              {/* Lesson Actions */}
              <div className="lesson-actions">
                <Button
                  data-testid="previous-lesson-btn"
                  onClick={goToPreviousLesson}
                  disabled={currentLessonIndex === 0}
                  variant="outline"
                >
                  <ChevronLeft size={18} />
                  Previous
                </Button>

                {!completedLessons.has(currentLesson?.id) && (
                  <Button
                    data-testid="mark-complete-btn"
                    onClick={markLessonComplete}
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Mark as Complete
                  </Button>
                )}

                <Button
                  data-testid="next-lesson-btn"
                  onClick={goToNextLesson}
                  disabled={currentLessonIndex === lessons.length - 1}
                >
                  Next
                  <ChevronRight size={18} />
                </Button>
              </div>
            </>
          )}
        </main>

        {/* AI Tutor Sidebar */}
        {showAITutor && (
          <aside className="ai-tutor-sidebar" data-testid="ai-tutor">
            <div className="tutor-header">
              <h3>AI Tutor</h3>
              <button onClick={() => setShowAITutor(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <ScrollArea className="tutor-messages">
              {tutorMessages.length === 0 ? (
                <div className="tutor-welcome">
                  <MessageSquare size={48} className="welcome-icon" />
                  <p>Ask me anything about this course!</p>
                </div>
              ) : (
                <div className="messages-list">
                  {tutorMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.role}`}
                      data-testid={`tutor-message-${index}`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {tutorLoading && (
                    <div className="message assistant loading">
                      Thinking...
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="tutor-input">
              <Textarea
                data-testid="tutor-input"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Ask a question..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askAITutor();
                  }
                }}
              />
              <Button
                data-testid="send-message-btn"
                onClick={askAITutor}
                disabled={tutorLoading || !tutorInput.trim()}
              >
                <Send size={18} />
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}