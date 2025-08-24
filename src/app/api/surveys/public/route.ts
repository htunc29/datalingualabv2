import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Survey from '@/models/Survey';
import Response from '@/models/Response';
import User from '@/models/User';
import Admin from '@/models/Admin';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const recent = searchParams.get('recent') === 'true';

    let query: any = { isActive: { $ne: false } }; // Only show active surveys

    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get surveys with optional limit
    const surveysQuery = recent 
      ? Survey.find(query).sort({ createdAt: -1 }).limit(limit)
      : Survey.find(query).sort({ createdAt: -1 });
    
    const surveys = await surveysQuery;

    // Get response counts and creator info for each survey
    const surveysWithStats = await Promise.all(
      surveys.map(async (survey) => {
        // Get response count
        const responseCount = await Response.countDocuments({ surveyId: survey._id });

        // Get creator information
        let creatorInfo = null;
        if (survey.createdBy) {
          if (survey.createdByType === 'user') {
            const user = await User.findById(survey.createdBy).select('firstName lastName organization');
            if (user) {
              creatorInfo = {
                name: `${user.firstName} ${user.lastName}`,
                organization: user.organization,
                type: 'Researcher'
              };
            }
          } else if (survey.createdByType === 'admin') {
            const admin = await Admin.findById(survey.createdBy).select('username');
            if (admin) {
              creatorInfo = {
                name: admin.username,
                organization: 'DataLinguaLab',
                type: 'Administrator'
              };
            }
          }
        }

        // Calculate basic stats
        const questionCount = survey.questions.length;
        const hasAudio = survey.questions.some(q => q.type === 'audio');
        const hasFiles = survey.questions.some(q => q.type === 'file-upload');

        return {
          _id: survey._id,
          title: survey.title,
          description: survey.description,
          shareableId: survey.shareableId,
          questionCount,
          responseCount,
          hasAudio,
          hasFiles,
          createdAt: survey.createdAt,
          createdBy: creatorInfo,
          // Calculate response rate (assuming we had some target or baseline)
          responseRate: responseCount > 0 ? `${responseCount} responses` : 'No responses yet'
        };
      })
    );

    return NextResponse.json({
      surveys: surveysWithStats,
      total: surveysWithStats.length
    });
  } catch (error) {
    console.error('Error fetching public surveys:', error);
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}