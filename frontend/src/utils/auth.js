export function saveAuth(data) {
  localStorage.setItem("ts_token", data.token);
  localStorage.setItem(
    "ts_user",
    JSON.stringify(data.user)
  );
}

export function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem("ts_user")
    );
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(
    localStorage.getItem("ts_token")
  );
}

export function logout() {
  localStorage.removeItem("ts_token");
  localStorage.removeItem("ts_user");
}