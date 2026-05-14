import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Member } from "@/lib/models";
import { apiError, apiJson } from "@/lib/scheduling/api-utils";
import { requireUser } from "@/lib/scheduling/auth-helpers";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    // Require authentication
    await requireUser(["ADMIN", "DEPARTMENT_HEAD", "MEMBER"]);

    const { id } = await params;
    const body = await req.json();

    // VULNERABILITY: Blindly updating the member with whatever is in the body.
    // This allows a "MEMBER" (Staff) to send { "accessRole": "ADMIN" } and escalate privileges.
    // It also allows updating other users if the ID is known.
    
    if (body.regeneratePortalToken) {
        body.portalToken = Math.random().toString(36).substring(7);
        delete body.regeneratePortalToken;
    }

    const updated = await Member.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) return apiError("Member not found", 404);

    return apiJson(updated);
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    // VULNERABILITY: Anyone can delete anyone.
    await requireUser(["ADMIN", "DEPARTMENT_HEAD", "MEMBER"]);

    const { id } = await params;
    await Member.findByIdAndDelete(id);

    return apiJson({ success: true });
  } catch (error: any) {
    return apiError(error.message, 400);
  }
}
