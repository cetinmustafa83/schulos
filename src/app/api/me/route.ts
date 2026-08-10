import { NextResponse } from 'next/server'

// Mock current user - in a real app this would come from session/auth
// We expose a role switcher so the user can experience different panels
export async function GET() {
  return NextResponse.json({
    id: 'usr-admin',
    name: 'System Administrator',
    email: 'admin@school.edu.tr',
    role: 'ADMIN',
    avatar: null,
    phone: '+90 555 000 0001',
  })
}
