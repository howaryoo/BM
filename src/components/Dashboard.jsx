import React, { useState } from 'react';
import { LayoutDashboard, Users, UserCheck, Calendar, BookOpen, BarChart3, Star, CheckSquare, Plus, CheckCircle, GraduationCap } from 'lucide-react';

export default function Dashboard({
  onSelectVerse,
  allVersesCount = 8
}) {
  const [userRole, setUserRole] = useState('student'); // 'student' or 'teacher'

  // Mock assignment state
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Parashat Bereishit - First Aliyah', verses: '1-8', dateAssigned: '2026-06-01', targetMotifs: ['Munach-Etnachta', 'Mercha-Tifcha'], complete: false }
  ]);

  // Mock student roster for teacher
  const [students, setStudents] = useState([
    { id: 'ari-stern', name: 'Ari Stern', age: 12, parasha: 'Bereishit', aliyah: 1, overallMastery: 78, practicedVerses: [1, 2, 3, 4], streak: 5 },
    { id: 'ben-levy', name: 'Benjamin Levy', age: 13, parasha: 'Bereishit', aliyah: 1, overallMastery: 92, practicedVerses: [1, 2, 3, 4, 5, 6, 7, 8], streak: 12 },
    { id: 'david-cohen', name: 'David Cohen', age: 12, parasha: 'Bereishit', aliyah: 1, overallMastery: 45, practicedVerses: [1, 2], streak: 1 }
  ]);

  // Student progress states
  const [practicedVerses, setPracticedVerses] = useState({
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false
  });

  const toggleVersePracticed = (idx) => {
    setPracticedVerses(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getStudentCompletionPercentage = () => {
    const checked = Object.values(practicedVerses).filter(Boolean).length;
    return Math.round((checked / allVersesCount) * 100);
  };

  // Analytics formulas
  // Total motifs in Genesis 1:1-8 is roughly 25.
  // Top 3 motifs (Munach-Etnachta, Munach-Zaqef, Mercha-Tifcha) cover about 65% of the text.
  const motifStats = [
    { name: 'Mercha-Tifcha (מרכא טפחא)', count: 8, coverage: '32%', mastered: 90 },
    { name: 'Munach-Etnachta (מונח אתנחתא)', count: 6, coverage: '24%', mastered: 85 },
    { name: 'Munach-Zaqef (מונח זקף)', count: 5, coverage: '20%', mastered: 70 },
    { name: 'Mahpach-Pashta (מהפך פשטא)', count: 3, coverage: '12%', mastered: 50 },
    { name: 'Darga-Tevir (דרגא תביר)', count: 2, coverage: '8%', mastered: 40 },
    { name: 'Kadma-Azla (קדמא ואזלא)', count: 1, coverage: '4%', mastered: 20 }
  ];

  return (
    <div className="dashboard-panel glass-card">
      <div className="panel-header border-b">
        <h4 className="panel-title">
          <LayoutDashboard size={18} className="icon-gold" />
          <span>לוח בקרה והישגים (Bar Mitzvah Coaching Dashboard)</span>
        </h4>

        <div className="btn-group">
          <button
            className={`btn btn-sm ${userRole === 'student' ? 'btn-active' : ''}`}
            onClick={() => setUserRole('student')}
          >
            Student Portal
          </button>
          <button
            className={`btn btn-sm ${userRole === 'teacher' ? 'btn-active' : ''}`}
            onClick={() => setUserRole('teacher')}
          >
            Teacher Portal
          </button>
        </div>
      </div>

      {userRole === 'student' ? (
        /* STUDENT PORTAL */
        <div className="dashboard-content student-dashboard p-6">
          <div className="dashboard-header-summary mb-6 flex justify-between items-center bg-dark p-4 rounded border">
            <div>
              <h3 className="font-bold text-lg text-gold flex items-center gap-2">
                <GraduationCap className="icon-gold" /> Welcome Back, Ari!
              </h3>
              <p className="text-xs text-muted mt-1">
                Active Streak: <span className="text-teal font-bold">5 Days Practice</span> | Target Date: Sep 12, 2026
              </p>
            </div>
            <div className="circular-progress flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-teal">
                {getStudentCompletionPercentage()}%
              </span>
              <span className="text-[10px] text-muted uppercase tracking-wider">Aliyah Complete</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Assignments */}
            <div className="card-section">
              <h5 className="section-subtitle text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                <Calendar size={14} className="icon-gold" /> Active Assignments
              </h5>
              
              <div className="assignment-cards flex flex-col gap-2">
                {assignments.map(assign => (
                  <div key={assign.id} className="assign-item border bg-dark p-3 rounded flex justify-between items-start">
                    <div>
                      <span className="text-sm font-semibold block">{assign.title}</span>
                      <span className="text-xs text-muted block mt-1">
                        Verses: {assign.verses} | Assigned: {assign.dateAssigned}
                      </span>
                      <div className="flex gap-1 mt-2">
                        {assign.targetMotifs.map(m => (
                          <span key={m} className="badge-verse text-[10px]">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="badge-percent bg-gold-dark text-[10px] uppercase font-bold tracking-wider">
                      In Progress
                    </span>
                  </div>
                ))}
              </div>

              {/* Verses Checklist */}
              <h5 className="section-subtitle text-xs font-bold uppercase tracking-wider mt-5 mb-3 flex items-center gap-1">
                <CheckSquare size={14} className="icon-gold" /> Verse Practice Checklist
              </h5>
              <div className="verses-checklist-grid">
                {Array.from({ length: allVersesCount }).map((_, i) => {
                  const idx = i + 1;
                  const isChecked = practicedVerses[idx];
                  return (
                    <label
                      key={idx}
                      className={`checklist-item ${isChecked ? 'item-checked' : ''}`}
                      onClick={() => onSelectVerse(idx)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleVersePracticed(idx)}
                        onClick={(e) => e.stopPropagation()} // don't select verse on checkbox toggle
                      />
                      <span>Verse {idx}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Motif Mastery Scores */}
            <div className="card-section">
              <h5 className="section-subtitle text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                <Star size={14} className="icon-gold" /> Motif Mastery Index
              </h5>

              <div className="mastery-progress-list flex flex-col gap-3">
                {motifStats.map(stat => (
                  <div key={stat.name} className="mastery-progress-item">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-gold">{stat.name}</span>
                      <span className="font-mono text-teal font-bold">{stat.mastered}% Mastered</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${stat.mastered}%`, backgroundColor: stat.mastered > 75 ? 'var(--color-teal)' : 'var(--color-gold)' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TEACHER PORTAL */
        <div className="dashboard-content teacher-dashboard p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Roster */}
            <div className="card-section md:col-span-1 border-r pr-4">
              <h5 className="section-subtitle text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                <Users size={14} className="icon-gold" /> Student Roster
              </h5>

              <div className="student-list flex flex-col gap-2">
                {students.map(std => (
                  <div key={std.id} className="student-card border bg-dark p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{std.name}</span>
                      <span className="text-xs text-muted font-bold font-mono">Streak: {std.streak}d</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Portion: {std.parasha} | Aliyah {std.aliyah}
                    </p>
                    <div className="student-mastery flex items-center gap-2 mt-2">
                      <div className="progress-bar-bg flex-1">
                        <div
                          className="progress-bar-fill bg-teal"
                          style={{ width: `${std.overallMastery}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-teal">{std.overallMastery}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary text-xs w-full mt-4 flex items-center justify-center gap-1">
                <Plus size={14} /> Add New Student
              </button>
            </div>

            {/* In-depth Analytics & Coverage */}
            <div className="card-section md:col-span-2 pl-4">
              <h5 className="section-subtitle text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                <BarChart3 size={14} className="icon-gold" /> Aliyah Motif Coverage Analytics
              </h5>

              <div className="analytics-summary-box border bg-dark p-4 rounded mb-4">
                <h6 className="text-sm font-bold text-gold mb-1">Syntactic Grammar Coverage</h6>
                <p className="text-xs text-muted mb-3 leading-relaxed">
                  Analyzing the grammatical motifs in Parashat Bereishit - 1st Aliyah (Genesis 1:1–8) reveals the following:
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="border-r">
                    <span className="text-2xl font-bold text-teal font-mono">63%</span>
                    <span className="text-[10px] text-muted block uppercase tracking-wider">Covered by Top 3 Motifs</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gold font-mono">84%</span>
                    <span className="text-[10px] text-muted block uppercase tracking-wider">Covered by Top 6 Motifs</span>
                  </div>
                </div>
              </div>

              {/* Motif Frequency Table */}
              <h6 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Motif Frequency Table</h6>
              <div className="alignment-table-wrapper max-h-56 overflow-y-auto">
                <table className="alignment-table w-full text-xs">
                  <thead>
                    <tr className="bg-dark text-left border-b">
                      <th className="p-2">Motif Pattern</th>
                      <th className="p-2">Occurrences</th>
                      <th className="p-2">Aliyah Coverage</th>
                      <th className="p-2">Average Mastery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motifStats.map(stat => (
                      <tr key={stat.name} className="border-b hover-bg-dark">
                        <td className="p-2 font-semibold text-gold">{stat.name}</td>
                        <td className="p-2 font-mono">{stat.count}</td>
                        <td className="p-2 font-mono text-muted">{stat.coverage}</td>
                        <td className="p-2">
                          <span className={`font-bold font-mono ${stat.mastered > 75 ? 'text-teal' : 'text-gold'}`}>
                            {stat.mastered}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
