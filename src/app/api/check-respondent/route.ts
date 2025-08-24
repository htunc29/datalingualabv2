import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Response from '@/models/Response';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { surveyId, respondentId } = await request.json();

    if (!surveyId || !respondentId) {
      return NextResponse.json({ error: 'Survey ID and respondent ID required' }, { status: 400 });
    }

    // Check if this respondent has already submitted a response for this survey
    const existingResponse = await Response.findOne({ 
      surveyId, 
      respondentId 
    });

    return NextResponse.json({
      hasResponded: !!existingResponse,
      responseId: existingResponse?._id || null,
      submittedAt: existingResponse?.submittedAt || null
    });
  } catch (error) {
    console.error('Respondent check error:', error);
    return NextResponse.json({ error: 'Failed to check respondent' }, { status: 500 });
  }
}