import CryptoJS from "crypto-js";
import { request as undiciRequest } from "undici";

import { BASE_URL, type Credentials } from "./utils";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export type ClientOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  credentials: Credentials;
};

export type OKXResponse<T> = { code: string; msg: string; data: T };

function buildQuery(query?: Record<string, string | number | boolean | undefined>) {
  if (!query) return "";
  const entries = Object.entries(query).filter(([, v]) => v !== undefined);
  entries.sort(([a], [b]) => a.localeCompare(b));
  const sp = new URLSearchParams(entries.map(([k, v]) => [k, String(v)] as [string, string]));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function sign(
  ts: string,
  method: Method,
  path: string,
  queryString: string,
  bodyStr: string | undefined,
  secret: string,
) {
  const toSign = ts + method + path + (method === "GET" ? queryString : (bodyStr ?? ""));
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(toSign, secret));
}

export class OKXClient {
  private baseUrl: string;
  private timeoutMs: number;
  private creds: Credentials;

  constructor(opts: ClientOptions) {
    this.baseUrl = opts.baseUrl ?? BASE_URL;
    this.timeoutMs = opts.timeoutMs ?? 10_000;
    this.creds = opts.credentials;
  }

  private async send<T>(method: Method, path: string, opts?: { query?: Record<string, any>; body?: any }) {
    const qs = buildQuery(opts?.query);
    const url = new URL(path + qs, this.baseUrl).toString();
    const bodyStr = opts?.body !== undefined ? JSON.stringify(opts.body) : undefined;
    const ts = new Date().toISOString();

    const headers = {
      "Content-Type": "application/json",
      "OK-ACCESS-KEY": this.creds.apiKey,
      "OK-ACCESS-SIGN": sign(ts, method, path, qs, bodyStr, this.creds.secretKey),
      "OK-ACCESS-TIMESTAMP": ts,
      "OK-ACCESS-PASSPHRASE": this.creds.passphrase,
      "OK-ACCESS-PROJECT": this.creds.projectId,
    } as const;

    const res = await undiciRequest(url, {
      method,
      headers,
      body: bodyStr,
      headersTimeout: this.timeoutMs,
      bodyTimeout: this.timeoutMs,
    });

    const text = await res.body.text();
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(`HTTP ${res.statusCode}: ${text}`);
    }
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON: ${text}`);
    }
    if (parsed && typeof parsed === "object" && "code" in parsed) {
      const p = parsed as OKXResponse<T>;
      if (p.code !== "0") throw new Error(`OKXError ${p.code}: ${p.msg}`);
      return p.data;
    }
    return parsed as T;
  }

  getJSON<T>(path: string, query?: Record<string, any>) {
    return this.send<T>("GET", path, { query });
  }
  postJSON<T>(path: string, body?: any, query?: Record<string, any>) {
    return this.send<T>("POST", path, { body, query });
  }
}
