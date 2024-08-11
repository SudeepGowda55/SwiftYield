"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verify } from "../api/verify";
import { IDKitWidget, type ISuccessResult, VerificationLevel } from "@worldcoin/idkit";

const Worldcoin = () => {
  const router = useRouter();

  const onSuccess = () => {
    router.push("/arbitrage/base-tenderly");
  };

  const handleProof = async (result: ISuccessResult) => {
    console.log("Proof received from IDKit, sending to backend: \n", JSON.stringify(result));
    const data = await verify(result); // sending the data to web backend
    if (data.success) {
      console.log("Successful response from backend:\n", JSON.stringify(data)); // Log the response from our backend for visibility
    } else {
      throw new Error(`Verification failed: ${data.detail}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-row items-center justify-center bg-gray-100 space-x-6">
      {/* Human Verification Box */}
      <div className="bg-white text-black shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Human Verification</h1>
        <p className="mb-2 text-center">
          Please confirm your identity by verifying that you are a human. This step helps us prevent automated access
          and maintain security.
        </p>
        <div className="flex justify-center mt-6">
          <IDKitWidget
            app_id="app_staging_1c7e9401f6b5e43c4f649812c0c4ef76"
            action="cloud-verification"
            onSuccess={onSuccess}
            handleVerify={handleProof}
            verification_level={VerificationLevel.Orb}
          >
            {({ open }) => (
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={open}>
                Verify with World ID
              </button>
            )}
          </IDKitWidget>
        </div>
      </div>

      {/* Worldcoin Verification Box */}
      <div className="bg-white text-black shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Worldcoin Verification</h1>
        <p className="mb-2 text-center">
          Verify your identity using the Worldcoin simulator. This innovative tool ensures the authenticity of user
          identities through advanced verification methods.
        </p>
        <p className="mb-6 text-center">
          Access the simulator here:{" "}
          <span className="text-orange-600 font-semibold">
            <Link href={"https://simulator.worldcoin.org/id/0x18310f83"}>Worldcoin Simulator</Link>
          </span>
        </p>
      </div>
    </div>
  );
};

export default Worldcoin;
