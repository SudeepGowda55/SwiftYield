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
    <div>
      <div className="min-h-[60vh] flex flex-row items-center justify-center bg-gray-100 space-x-6">
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
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  onClick={open}
                >
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
      <div className="bg-gray-100 text-black">
        <div className="flex px-8 mx-7 flex-col items-center w-[90vw]">
          <b className="text-left">Note:</b>
          <p>
            You can either Scan the QR code from a simulator or click on the QR code the code will be copied and then
            select paste code option in simulator and paste the code, choose verify with orb and wait until verification
            is done
          </p>
          <p>
            {" "}
            <b>Make sure the identity is orb and device verified</b>
          </p>
          <p>
            If you are not able to verify it, just move to the Flash Loan contract deploy page by clicking here{" "}
            <Link href="/arbitrage/base-tenderly" className="text-orange-500">
              /arbitrage/base-tenderly
            </Link>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Worldcoin;
