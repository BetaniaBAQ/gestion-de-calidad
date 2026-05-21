import { action } from './_generated/server'
import { v } from 'convex/values'
import { assertAdmin } from './lib/auth'

export const inviteUser = action({
  args: {
    email: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    invitationId: string
    invitationUrl: string | null
  }> => {
    await assertAdmin(ctx)

    const apiKey = process.env.WORKOS_API_KEY
    if (!apiKey) {
      throw new Error('WORKOS_API_KEY not configured')
    }

    const res = await fetch(
      'https://api.workos.com/user_management/invitations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: args.email,
          organization_id: args.orgId,
        }),
      }
    )

    if (!res.ok) {
      throw new Error(
        `WorkOS invitation failed (${res.status}): ${await res.text()}`
      )
    }

    const invite = (await res.json()) as {
      id: string
      accept_invitation_url?: string
    }

    return {
      invitationId: invite.id,
      invitationUrl: invite.accept_invitation_url ?? null,
    }
  },
})
