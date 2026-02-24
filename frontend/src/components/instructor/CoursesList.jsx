import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Plus } from 'lucide-react';

export default function CoursesList({ courses, instructorId, onRefresh }) {
  const navigate = useNavigate();

  if (courses.length === 0) {
    return (
      <div className="empty-state" data-testid="no-courses">
        <p>No courses created yet</p>
        <p className="text-sm text-gray-500">Click "Create Course" to get started</p>
      </div>
    );
  }

  return (
    <div className="courses-management" data-testid="courses-list">
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-manage-card" data-testid={`course-card-${course.id}`}>
            <div className="course-thumbnail">
              <img src={course.thumbnail || '/placeholder-course.png'} alt={course.title} />
              <span className={`status-badge ${course.status}`}>
                {course.status}
              </span>
            </div>
            <div className="course-info">
              <h3>{course.title}</h3>
              <p className="category">{course.category}</p>
              <p className="price">${course.price}</p>
              <div className="course-actions">
                <Button
                  data-testid={`manage-course-${course.id}`}
                  onClick={() => navigate(`/instructor/course/${course.id}`)}
                  size="sm"
                >
                  <Edit size={16} className="mr-1" />
                  Manage
                </Button>
                <Button
                  data-testid={`view-course-${course.id}`}
                  onClick={() => navigate(`/course/${course.id}`)}
                  variant="outline"
                  size="sm"
                >
                  <Eye size={16} className="mr-1" />
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}