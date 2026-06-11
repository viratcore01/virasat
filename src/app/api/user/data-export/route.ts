import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { VaultItem } from '@/models/VaultItem'
import { Message } from '@/models/Message'
import { Beneficiary } from '@/models/Beneficiary'
import { Executor } from '@/models/Executor'
import { AccessLog } from '@/models/AccessLog'
import { ConsentLog } from '@/models/ConsentLog'

/**
 * GET /api/user/data-export
 * 
 * Export all user personal data (DPDP Act compliance)
 * Returns JSON with all non-deleted user data
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get authenticated user from session
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Log the data export action
    await AccessLog.create({
      userId: user._id.toString(),
      action: 'data_export',
      resourceType: 'account',
      resourceId: user._id.toString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      success: true,
      details: { exportFormat: 'json' },
    })

    // Fetch all related data
    const [vaultItems, messages, beneficiaries, executors, consentLogs] = await Promise.all([
      VaultItem.find({ userId: user._id }),
      Message.find({ userId: user._id }),
      Beneficiary.find({ userId: user._id }),
      Executor.find({ userId: user._id }),
      ConsentLog.find({ userId: user._id }),
    ])

    // Build export object
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      exportVersion: '1.0',
      dataProtectionNotice: 'This export contains your personal data as per DPDP Act 2023. Keep it safe and confidential.',
      
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        religion: user.religion,
        dob: user.dob,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        consentGiven: user.consentGiven,
        consentAt: user.consentAt,
        consentVersion: user.consentVersion,
        checkInFrequency: user.checkInFrequency,
        lastCheckIn: user.lastCheckIn,
      },

      vault: {
        count: vaultItems.length,
        items: vaultItems.map(item => ({
          id: item._id.toString(),
          category: item.category,
          title: item.title,
          assignedTo: item.assignedTo,
          hasAttachment: item.hasAttachment,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Note: encrypted data is NOT exported (it remains encrypted on servers only)
        })),
      },

      messages: {
        count: messages.length,
        items: messages.map(msg => ({
          id: msg._id.toString(),
          type: msg.type,
          title: msg.title,
          assignedTo: msg.assignedTo,
          triggerType: msg.triggerType,
          triggerDate: msg.triggerDate,
          delivered: msg.delivered,
          createdAt: msg.createdAt,
          // Note: encrypted content is NOT exported
        })),
      },

      beneficiaries: {
        count: beneficiaries.length,
        items: beneficiaries.map(ben => ({
          id: ben._id.toString(),
          name: ben.name,
          email: ben.email,
          phone: ben.phone,
          relationship: ben.relationship,
          createdAt: ben.createdAt,
        })),
      },

      executors: {
        count: executors.length,
        items: executors.map(exec => ({
          id: exec._id.toString(),
          name: exec.name,
          email: exec.email,
          phone: exec.phone,
          relationship: exec.relationship,
          status: exec.status,
          createdAt: exec.createdAt,
        })),
      },

      consentHistory: {
        count: consentLogs.length,
        items: consentLogs.map(log => ({
          consentType: log.consentType,
          consentVersion: log.consentVersion,
          status: log.status,
          timestamp: log.timestamp,
        })),
      },

      dataRetention: {
        note: 'Your data will be retained as long as your account is active. You can request deletion at any time.',
        dataRetentionUntil: user.dataRetentionUntil,
      },
    }

    // Return as JSON file download
    const fileName = `virasat-data-export-${user.email}-${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    })

  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
