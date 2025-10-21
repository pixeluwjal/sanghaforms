import { NextRequest, NextResponse } from 'next/server';

const SOURCES = [
  "Mane Mane Samparka",
  "Street Samparka",
  "BJP Karyakartha", 
  "Bala Bharathi Parent",
  "Kishora Bharathi Parent",
  "Maithreyi Parent",
  "Mithra Parent",
  "Sevika Samithi Spouse",
  "Relocation from another Milan",
  "Sangha Utsav",
  "Join RSS Website", 
  "Join RSS Campaign",
  "Friend Circle",
  "Relation Circle",
  "Yuva Conclave",
  "Yuva Samavesha",
  "Existing Pattlist SS"
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      sources: SOURCES
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}