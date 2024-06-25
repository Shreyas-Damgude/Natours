import { showAlert } from "./alerts";

export async function signup(data) {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", "Account Created!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
}
