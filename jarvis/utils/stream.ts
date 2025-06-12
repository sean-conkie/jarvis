import { backendUrl } from "./backend";

export function newStream(url: string): EventSource {
  const fullUrl = `${backendUrl}${url}`;
  return new EventSource(fullUrl);
}