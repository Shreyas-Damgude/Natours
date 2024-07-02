import { showAlert } from "./alerts";

export async function authenticate(action, data) {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/users/${action}`,
      data,
    });

    if (res.data.status === "success") {
      showAlert(
        "success",
        action === "signup" ? "Account Created!" : "Logged in successfully!"
      );
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
}

export async function logout() {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged out!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", "Error logging out! Try again");
  }
}

export async function deleteAccount() {
  try {
    const res = await axios({
      method: "DELETE",
      url: "/api/v1/users/deleteMe",
    });

    if (res.status === 204) {
      showAlert("success", "Account Deleted");
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
}
