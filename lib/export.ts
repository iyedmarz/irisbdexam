import { ExamSubmission, Exam, User } from '../types';

export const exportToCSV = (submissions: ExamSubmission[], exam: Exam, students: User[]) => {
  const headers = ['Student Name', 'Student ID', 'Score', 'Total Questions', 'Percentage', 'Submitted At'];
  const rows = submissions.map(sub => {
    const student = students.find(s => s.id === sub.studentId);
    const percentage = ((sub.score / sub.totalQuestions) * 100).toFixed(2);
    return [
      student?.name || 'Unknown',
      sub.studentId,
      sub.score.toString(),
      sub.totalQuestions.toString(),
      `${percentage}%`,
      new Date(sub.submittedAt).toLocaleString()
    ];
  });

  const csvContent = [
    `Exam: ${exam.title}`,
    `Created: ${new Date(exam.createdAt).toLocaleString()}`,
    `Duration: ${exam.duration} minutes`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${exam.title.replace(/\s+/g, '_')}_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (submissions: ExamSubmission[], exam: Exam, students: User[]) => {
  const content = `
    <html>
      <head>
        <title>${exam.title} - Results</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f4f4f4; }
          .header-info { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${exam.title} - Exam Results</h1>
        <div class="header-info">
          <p><strong>Created:</strong> ${new Date(exam.createdAt).toLocaleString()}</p>
          <p><strong>Duration:</strong> ${exam.duration} minutes</p>
          <p><strong>Total Questions:</strong> ${exam.questions.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Score</th>
              <th>Total</th>
              <th>Percentage</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            ${submissions.map(sub => {
              const student = students.find(s => s.id === sub.studentId);
              const percentage = ((sub.score / sub.totalQuestions) * 100).toFixed(2);
              return `
                <tr>
                  <td>${student?.name || 'Unknown'}</td>
                  <td>${sub.score}</td>
                  <td>${sub.totalQuestions}</td>
                  <td>${percentage}%</td>
                  <td>${new Date(sub.submittedAt).toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
