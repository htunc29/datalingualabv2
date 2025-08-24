import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Response from '@/models/Response';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const surveyId = formData.get('surveyId') as string;
    const respondentId = formData.get('respondentId') as string;
    const answersJson = formData.get('answers') as string;
    
    if (!surveyId || !respondentId || !answersJson) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const answers = JSON.parse(answersJson);
    
    // Process audio files
    const audioAnswers = [];
    for (const [key, file] of formData.entries()) {
      if (key.startsWith('audio_') && file instanceof File) {
        const questionId = key.replace('audio_', '');
        const fileName = `${uuidv4()}.webm`;
        const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
        const audioPath = path.join(audioDir, fileName);
        
        // Ensure audio directory exists
        await mkdir(audioDir, { recursive: true });
        
        // Save audio file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(audioPath, buffer);
        
        // Update answer with audio path
        const answer = answers.find((a: any) => a.questionId === questionId);
        if (answer) {
          answer.audioPath = `/uploads/audio/${fileName}`;
        }
        
        audioAnswers.push({
          questionId,
          audioPath: `/uploads/audio/${fileName}`
        });
      }
    }

    // Process uploaded files
    for (const [key, file] of formData.entries()) {
      if (key.startsWith('file_') && file instanceof File) {
        const questionId = key.replace('file_', '');
        const fileExt = file.name.split('.').pop() || 'bin';
        const fileName = `${uuidv4()}.${fileExt}`;
        const fileDir = path.join(process.cwd(), 'public', 'uploads', 'files');
        const filePath = path.join(fileDir, fileName);
        
        // Ensure file directory exists
        await mkdir(fileDir, { recursive: true });
        
        // Save uploaded file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);
        
        // Update answer with file path
        const answer = answers.find((a: any) => a.questionId === questionId);
        if (answer) {
          answer.filePath = `/uploads/files/${fileName}`;
          answer.answer = `File uploaded: ${file.name}`;
        }
      }
    }
    
    // Save response to database
    const response = new Response({
      surveyId,
      respondentId,
      answers
    });
    
    await response.save();
    
    return NextResponse.json({ 
      message: 'Response submitted successfully',
      responseId: response._id 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');
    
    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID required' }, { status: 400 });
    }
    
    const responses = await Response.find({ surveyId }).sort({ submittedAt: -1 });
    return NextResponse.json(responses);
    
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}