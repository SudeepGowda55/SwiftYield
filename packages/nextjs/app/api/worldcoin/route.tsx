"use server";

import { VerificationLevel } from "@worldcoin/idkit";
import { verifyCloudProof } from "@worldcoin/idkit-core/backend";

export type VerifyReply = {
  success: boolean;
  code?: string;
  attribute?: string | null;
  detail?: string;
};

interface IVerifyRequest {
  proof: {
    nullifier_hash: string;
    merkle_root: string;
    proof: string;
    verification_level: VerificationLevel;
  };
  signal?: string;
}

const app_id = "app_staging_1c7e9401f6b5e43c4f649812c0c4ef76";
const action = "cloud-verification";

export async function verify(proof: IVerifyRequest["proof"], signal?: string): Promise<VerifyReply> {
  const verifyRes = await verifyCloudProof(proof, app_id, action, signal);

  if (verifyRes.success) {
    return { success: true };
  } else {
    return { success: false, code: verifyRes.code, attribute: verifyRes.attribute, detail: verifyRes.detail };
  }
}
