import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Survey from '@/models/Survey';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareableId: string }> }
) {
  try {
    await dbConnect();
    const { shareableId } = await params;
    const survey = await Survey.findOne({ shareableId });
    
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
  }
}