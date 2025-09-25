export const BASE_URL = "https://web3.okx.com";
export const API_VERSION = "v6";

export type Credentials = {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  projectId: string;
};

export function getCredentialsFromEnv(): Credentials {
  const apiKey = process.env.OKX_API_KEY;
  const secretKey = process.env.OKX_SECRET_KEY;
  const passphrase = process.env.OKX_API_PASSPHRASE;
  const projectId = process.env.OKX_PROJECT_ID;

  if (!apiKey || !secretKey || !passphrase || !projectId) {
    throw new Error(
      "Missing required environment variables: OKX_API_KEY/OKX_SECRET_KEY/OKX_API_PASSPHRASE/OKX_PROJECT_ID"
    );
  }

  return { apiKey, secretKey, passphrase, projectId };
}
