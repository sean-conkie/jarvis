import { backendUrl } from "./backendUtils";

export function newStream(url: string): EventSource {
  const fullUrl = `${backendUrl}${url}`;
  return new EventSource(fullUrl);
}