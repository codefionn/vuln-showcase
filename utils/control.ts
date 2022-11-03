export function redirect(path: string): Response {
  return new Response(null, {
    status: 302,
    statusText: "TEMPORARY REDIRECT",
    headers: {
      "Location": path,
    },
  });
}
