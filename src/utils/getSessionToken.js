export function getSessionToken() {
  const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.split("=");
    acc[key] = valueParts.join("=");
    return acc;
  }, {});

  const projectRef = "bqumdvfrgjcwcnbdbrps";
  const sessionCookieName = `sb-${projectRef}-auth-token`;

  return cookies[sessionCookieName] || null;
}
