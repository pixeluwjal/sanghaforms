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
    // Return JUST the array, not wrapped in an object
    return NextResponse.json(SOURCES);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}