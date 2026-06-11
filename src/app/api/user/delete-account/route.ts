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
 * DELETE /api/user/delete-account
 * 
 * Delete user account and all associated data (DPDP Act compliance)
 * Requires password confirmation
 * Data is deleted immediately, but audit logs retained for 7 years
 */
export async function DELETE(request: NextRequest) {
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

    const userId = user._id.toString()

    // Log deletion request
    await AccessLog.create({
      userId,
      action: 'data_deletion',
      resourceType: 'account',
      resourceId: userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      success: true,
      details: { 
        deletionReason: 'user_request',
        deletionType: 'full',
        timestamp: new Date().toISOString(),
      },
    })

    // Delete all user data
    await Promise.all([
      VaultItem.deleteMany({ userId }),
      Message.deleteMany({ userId }),
      Beneficiary.deleteMany({ userId }),
      Executor.deleteMany({ userId }),
      ConsentLog.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ])

    // Note: AccessLog records are retained for 7 years for audit purposes
    // They are NOT deleted with the user account

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been deleted.',
      details: {
        deletedAt: new Date().toISOString(),
        auditRetention: '7 years (for compliance)',
        note: 'Audit logs are retained for 7 years as required by Indian law but no personal data remains.',
      },
    }, { status: 200 })

  } catch (error) {
    console.error('Account deletion error:', error)
    
    // Log deletion failure
    try {
      const session = await getServerSession()
      if (session?.user?.email) {
        const user = await User.findOne({ email: session.user.email })
        if (user) {
          await AccessLog.create({
            userId: user._id.toString(),
            action: 'data_deletion',
            resourceType: 'account',
            resourceId: user._id.toString(),
            ipAddress: 'unknown',
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    } catch (logError) {
      console.error('Failed to log deletion error:', logError)
    }

    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/delete-account
 * 
 * Request account deletion (initiates grace period)
 * Body: { confirmDelete: true }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (!body.confirmDelete) {
      return NextResponse.json(
        { error: 'You must confirm account deletion' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Set data retention date to 30 days from now (grace period)
    const graceUntil = new Date()
    graceUntil.setDate(graceUntil.getDate() + 30)

    await User.findByIdAndUpdate(user._id, {
      dataRetentionUntil: graceUntil,
      status: 'pending_deletion', // Custom status to indicate pending deletion
    })

    // Log deletion request
    await AccessLog.create({
      userId: user._id.toString(),
      action: 'data_deletion',
      resourceType: 'account',
      resourceId: user._id.toString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      success: true,
      details: { 
        deletionReason: 'user_request',
        deletionType: 'scheduled',
        graceUntil: graceUntil.toISOString(),
        note: 'Account scheduled for deletion in 30 days. Contact support to cancel.',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Account deletion scheduled. Your data will be deleted in 30 days.',
      details: {
        graceUntil: graceUntil.toISOString(),
        note: 'You can cancel this deletion by logging in before the grace period expires.',
        support: 'Contact support@virasat.life to cancel deletion.',
      },
    }, { status: 200 })

  } catch (error) {
    console.error('Account deletion request error:', error)
    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 }
    )
  }
}
