import { cookies } from "next/headers";
import type { Role } from "./types";
import { adminProfile, defaultProfile, getDemoDashboard } from "./mock-data";

const API_KEY = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const ADMIN_EMAIL = process.env.HEALTHIFY_ADMIN_EMAIL || "admin@healthify.app";

export type Session = {
  idToken: string;
  localId: string;
  role: Role;
  email: string;
};

export function hasFirebaseConfig() {
  return Boolean(API_KEY && PROJECT_ID);
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function setSessionCookies(session: Session) {
  const store = await cookies();
  store.set("healthify_session", session.idToken, cookieOptions());
  store.set("healthify_uid", session.localId, cookieOptions());
  store.set("healthify_role", session.role, cookieOptions());
  store.set("healthify_email", session.email, cookieOptions());
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete("healthify_session");
  store.delete("healthify_uid");
  store.delete("healthify_role");
  store.delete("healthify_email");
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const idToken = store.get("healthify_session")?.value;
  const localId = store.get("healthify_uid")?.value;
  const role = (store.get("healthify_role")?.value as Role | undefined) || "user";
  const email = store.get("healthify_email")?.value || defaultProfile.email;

  if (!idToken || !localId) return null;
  return { idToken, localId, role, email };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("Forbidden");
  return session;
}

export function getDemoUser(email: string) {
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  return isAdmin ? adminProfile : { ...defaultProfile, email };
}

export async function firebaseAuthRequest(path: string, body: unknown) {
  if (!API_KEY) throw new Error("Missing Firebase API key.");
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/${path}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || "Firebase auth request failed.");
  return data;
}

export async function lookupUser(idToken: string) {
  const data = await firebaseAuthRequest("accounts:lookup", { idToken });
  return data.users?.[0] || null;
}

type FirestoreField = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  arrayValue?: { values?: FirestoreField[] };
  mapValue?: { fields?: Record<string, FirestoreField> };
  nullValue?: null;
};

function serializeField(value: unknown): FirestoreField {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(serializeField) } };
  if (value && typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeField(item)])),
      },
    };
  }
  return { nullValue: null };
}

function deserializeField(field: FirestoreField | undefined): unknown {
  if (!field) return null;
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.integerValue !== undefined) return Number(field.integerValue);
  if (field.doubleValue !== undefined) return Number(field.doubleValue);
  if (field.booleanValue !== undefined) return field.booleanValue;
  if (field.arrayValue) return (field.arrayValue.values || []).map(deserializeField);
  if (field.mapValue) return Object.fromEntries(Object.entries(field.mapValue.fields || {}).map(([k, v]) => [k, deserializeField(v)]));
  return null;
}

function encodeDocument(data: Record<string, unknown>) {
  return { fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, serializeField(value)])) };
}

function decodeDocument(doc: { name?: string; fields?: Record<string, FirestoreField> }) {
  const data = Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, deserializeField(value)]));
  const id = doc.name?.split("/").pop();
  return { id, ...data };
}

async function firestoreRequest(path: string, options: RequestInit & { idToken: string }) {
  if (!PROJECT_ID) throw new Error("Missing Firebase project id.");
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.idToken}`,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || "Firestore request failed.");
  return data;
}

export async function upsertDocument(path: string, data: Record<string, unknown>, idToken: string) {
  return firestoreRequest(path, { method: "PATCH", body: JSON.stringify(encodeDocument(data)), idToken });
}

export async function createDocument(collectionPath: string, data: Record<string, unknown>, idToken: string) {
  return firestoreRequest(collectionPath, { method: "POST", body: JSON.stringify(encodeDocument(data)), idToken });
}

export async function listDocuments(collectionPath: string, idToken: string) {
  const data = await firestoreRequest(collectionPath, { method: "GET", idToken });
  return (data?.documents || []).map(decodeDocument);
}

export async function getDocument(path: string, idToken: string) {
  const data = await firestoreRequest(path, { method: "GET", idToken });
  return data ? decodeDocument(data) : null;
}

export async function updateDocument(path: string, data: Record<string, unknown>, idToken: string) {
  return firestoreRequest(path, { method: "PATCH", body: JSON.stringify(encodeDocument(data)), idToken });
}

export async function deleteDocument(path: string, idToken: string) {
  if (!PROJECT_ID) throw new Error("Missing Firebase project id.");
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
    cache: "no-store",
  });
  if (!res.ok && res.status !== 404) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message || "Delete failed.");
  }
  return true;
}

export function getDemoCollection<T extends keyof ReturnType<typeof getDemoDashboard>>(role: Role, key: T) {
  return getDemoDashboard(role)[key];
}
