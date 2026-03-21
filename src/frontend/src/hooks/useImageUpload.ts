import { HttpAgent } from "@icp-sdk/core/agent";
import { useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { identity } = useInternetIdentity();

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);
    try {
      const config = await loadConfig();

      const agentOptions: { host?: string; identity?: typeof identity } = {
        host: config.backend_host,
      };
      if (identity && !identity.getPrincipal().isAnonymous()) {
        agentOptions.identity = identity;
      }

      const agent = new HttpAgent(agentOptions);
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }

      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setProgress(pct),
      );
      const url = await storageClient.getDirectURL(hash);
      return url;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, progress };
}
