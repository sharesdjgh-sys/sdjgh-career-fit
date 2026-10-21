let campusToken = "";

export function setCampusToken(token: string) { campusToken = token; }

export function campusFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (campusToken) headers.set("Authorization", `Bearer ${campusToken}`);
  return fetch(input, { ...init, headers, cache: "no-store" });
}
