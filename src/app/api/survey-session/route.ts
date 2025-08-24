import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SurveySession from '@/models/SurveySession';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { surveyId, respondentId, action, questionId, questionIndex, timeSpent, answer } = await request.json();

    if (!surveyId || !respondentId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create session
    let session = await SurveySession.findOne({ surveyId, respondentId });
    
    if (!session) {
      // Create new session
      session = new SurveySession({
        surveyId,
        respondentId,
        startTime: new Date(),
        lastActivity: new Date(),
        currentQuestionIndex: questionIndex || 0,
        browserInfo: {
          userAgent: request.headers.get('user-agent') || '',
          language: request.headers.get('accept-language') || '',
          timezone: request.headers.get('timezone') || ''
        }
      });
    }

    // Add step to session
    session.steps.push({
      questionId: questionId || (action === 'completed' ? 'survey-completed' : 'survey'),
      questionIndex: questionIndex ?? (action === 'completed' ? -1 : 0),
      action,
      timestamp: new Date(),
      timeSpent: timeSpent || 0,
      answer: answer || undefined
    });

    // Update session metadata
    session.lastActivity = new Date();
    session.currentQuestionIndex = questionIndex || session.currentQuestionIndex;

    if (action === 'abandoned') {
      session.isAbandoned = true;
    } else if (action === 'completed') {
      session.isCompleted = true;
    }

    await session.save();

    return NextResponse.json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error('Survey session tracking error:', error);
    return NextResponse.json({ error: 'Failed to track session' }, { status: 500 });
  }
}

// Get session analytics
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');

    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID required' }, { status: 400 });
    }

    // Get abandonment statistics
    const totalSessions = await SurveySession.countDocuments({ surveyId });
    const completedSessions = await SurveySession.countDocuments({ surveyId, isCompleted: true });
    const abandonedSessions = await SurveySession.countDocuments({ surveyId, isAbandoned: true });

    // Get abandonment points (which questions cause most abandonment)
    const abandonmentPoints = await SurveySession.aggregate([
      { $match: { surveyId, isAbandoned: true } },
      { $unwind: '$steps' },
      { $match: { 'steps.action': 'abandoned' } },
      { 
        $group: { 
          _id: { 
            questionId: '$steps.questionId',
            questionIndex: '$steps.questionIndex'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Average time spent per question
    const avgTimePerQuestion = await SurveySession.aggregate([
      { $match: { surveyId } },
      { $unwind: '$steps' },
      { $match: { 'steps.action': { $in: ['answered', 'skipped'] } } },
      {
        $group: {
          _id: {
            questionId: '$steps.questionId',
            questionIndex: '$steps.questionIndex'
          },
          avgTime: { $avg: '$steps.timeSpent' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.questionIndex': 1 } }
    ]);

    return NextResponse.json({
      totalSessions,
      completedSessions,
      abandonedSessions,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(2) : 0,
      abandonmentRate: totalSessions > 0 ? (abandonedSessions / totalSessions * 100).toFixed(2) : 0,
      abandonmentPoints,
      avgTimePerQuestion
    });
  } catch (error) {
    console.error('Session analytics error:', error);
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 });
  }
}