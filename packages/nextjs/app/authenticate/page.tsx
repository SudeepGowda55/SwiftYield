"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verify } from "../api/verify";
import { IDKitWidget, type ISuccessResult, VerificationLevel } from "@worldcoin/idkit";

const Worldcoin = () => {
  const router = useRouter();

  const onSuccess = () => {
    router.push("/deploy");
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
      <div className="flex flex-col">
        <p>Verify you are human not a bot</p>
        <p>you can Verify using world coin simulator</p>
        <p>
          {" "}
          You can access the simulator from here{" "}
          <span className="text-orange-600">
            {" "}
            <Link href={"https://simulator.worldcoin.org/id/0x18310f83"}> Worldcoin Simulator</Link>{" "}
          </span>{" "}
        </p>
      </div>
      <div>
        <IDKitWidget
          app_id="app_staging_1c7e9401f6b5e43c4f649812c0c4ef76"
          action="cloud-verification"
          onSuccess={onSuccess}
          handleVerify={handleProof}
          verification_level={VerificationLevel.Orb}
        >
          {({ open }) => <button onClick={open}> Verify with World ID</button>}
        </IDKitWidget>
      </div>
    </div>
  );
};

export default Worldcoin;
