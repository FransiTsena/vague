import { NextResponse } from 'next/server';

// Mock data for Asset Provenance
const mockAssets = [
  {
    id: 'AST-90210',
    name: 'Presidential Suite Smart Mirror',
    category: 'Electronics',
    status: 'Verified',
    lastSync: '2 minutes ago',
    location: 'Suite 501',
    hash: '0x8f2a...3e12'
  },
  {
    id: 'AST-88231',
    name: 'Herman Miller Aeron Chair',
    category: 'Furniture',
    status: 'Verified',
    lastSync: '1 hour ago',
    location: 'Executive Office',
    hash: '0x4d1b...9aef'
  },
  {
    id: 'AST-77102',
    name: 'Dyson Air Purifier Gen5',
    category: 'Appliances',
    status: 'Warning',
    lastSync: '14 hours ago',
    location: 'Grand Ballroom',
    hash: '0x2c9e...fb41'
  },
  {
    id: 'AST-66543',
    name: 'Nespresso Vertuo Latissima',
    category: 'Appliances',
    status: 'Verified',
    lastSync: '3 hours ago',
    location: 'Staff Lounge',
    hash: '0x1a7d...be92'
  }
];

export async function GET() {
  // Simulate database latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    success: true,
    data: mockAssets,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate asset creation/minting
    const newAsset = {
      id: `AST-${Math.floor(10000 + Math.random() * 90000)}`,
      ...body,
      status: 'Pending',
      lastSync: 'Now',
      hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
    };

    return NextResponse.json({
      success: true,
      message: 'Asset identity minted successfully',
      data: newAsset
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to mint asset' },
      { status: 400 }
    );
  }
}
