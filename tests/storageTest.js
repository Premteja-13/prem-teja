/**
 * NoticeSense AI — Storage & Task Lifecycle Test
 */
const storageService = require('../server/services/storageService');

async function runStorageTest() {
  console.log('--- Testing Storage Service & Task Synchronization ---');

  const mockAnalysis = {
    summary: 'Mock test circular for fee payment.',
    category: 'Examinations',
    overall_confidence: 'high',
    deadlines: [
      {
        description: 'Pay exam fee',
        date_text: '2026-10-30',
        evidence: 'Pay fee before 30th October 2026'
      }
    ],
    tasks: [
      {
        task: 'Pay exam fee online',
        due_date: '2026-10-30',
        evidence: 'Pay fee before 30th October 2026'
      },
      {
        task: 'Submit printed receipt to office',
        due_date: '2026-11-02',
        evidence: 'Submit printed receipt to office by 2nd November'
      }
    ]
  };

  // 1. Save notice
  const saved = await storageService.saveNotice({
    title: 'Test Exam Notice 2026',
    originalText: 'Official exam notice. Pay fee before 30th October 2026. Submit printed receipt to office by 2nd November.',
    analysisJson: mockAnalysis
  });

  if (!saved || !saved.id) throw new Error('Failed to save notice');
  if (!Array.isArray(saved.tasks) || saved.tasks.length !== 2) throw new Error('Tasks not created on save');
  const taskId1 = saved.tasks[0].id;
  if (!taskId1) throw new Error('Task ID missing');
  console.log('  ✅ Notice saved with ID:', saved.id, 'and 2 tasks');

  // 2. Fetch notice by ID
  const fetched = await storageService.getNoticeById(saved.id);
  if (!fetched || fetched.tasks.length !== 2) throw new Error('Failed to fetch notice with tasks');
  console.log('  ✅ Notice fetched with tasks correctly');

  // 3. Check upcoming tasks
  const upcomingBefore = await storageService.getUpcomingTasks();
  const foundTask = upcomingBefore.find(t => t.id === taskId1);
  if (!foundTask || foundTask.completed !== false) throw new Error('Upcoming task not found in active list');
  console.log('  ✅ Upcoming active task found in list');

  // 4. Mark task 1 complete
  const updatedTask = await storageService.updateTaskStatus(taskId1, true);
  if (!updatedTask || updatedTask.completed !== true) throw new Error('Failed to update task status');
  console.log('  ✅ Task status updated to completed = true');

  // 5. Verify task is no longer in upcoming list
  const upcomingAfter = await storageService.getUpcomingTasks();
  const shouldBeAbsent = upcomingAfter.find(t => t.id === taskId1);
  if (shouldBeAbsent) throw new Error('Completed task should not appear in upcoming list');
  console.log('  ✅ Completed task excluded from upcoming list');

  // 6. Delete notice
  await storageService.deleteNotice(saved.id);
  const deletedCheck = await storageService.getNoticeById(saved.id);
  if (deletedCheck) throw new Error('Notice was not deleted');
  console.log('  ✅ Notice and its tasks deleted cleanly');

  console.log('\n🎉 Storage Service & Task Synchronization PASSED ALL CHECKS!\n');
}

runStorageTest().catch(err => {
  console.error('❌ Storage test failed:', err);
  process.exit(1);
});
