import React, { useState } from 'react';
import { 
  IoChevronBackOutline, 
  IoChevronForwardOutline,
  IoCalendarClearOutline 
} from 'react-icons/io5';

const Calendar = ({ interviews = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get the first day of the month and the number of days in the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Check if a date has interviews
  const getInterviewsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return interviews.filter(interview => {
      // Assuming interview.date is in format "Nov 15, 2024" or similar
      const interviewDate = new Date(interview.date);
      const interviewDateStr = `${interviewDate.getFullYear()}-${String(interviewDate.getMonth() + 1).padStart(2, '0')}-${String(interviewDate.getDate()).padStart(2, '0')}`;
      return interviewDateStr === dateStr;
    });
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-10"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayInterviews = getInterviewsForDate(day);
      const hasInterviews = dayInterviews.length > 0;
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      
      days.push(
        <div
          key={day}
          className={`h-10 w-10 flex items-center justify-center text-sm rounded-lg cursor-pointer relative transition-colors
            ${isToday ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-gray-100'}
            ${hasInterviews && !isToday ? 'bg-orange-100 text-orange-800 font-medium' : ''}
          `}
          title={hasInterviews ? `${dayInterviews.length} interview${dayInterviews.length > 1 ? 's' : ''}` : ''}
        >
          {day}
          {hasInterviews && (
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold
              ${isToday ? 'bg-white text-blue-600' : 'bg-orange-500 text-white'}
            `}>
              {dayInterviews.length}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <IoCalendarClearOutline />
          Interview Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoChevronBackOutline className="text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoChevronForwardOutline className="text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {generateCalendarDays()}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          Today
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded-full"></div>
          Interview Days
        </div>
      </div>
    </div>
  );
};

export default Calendar;
