import { showAlert } from "./alerts";

export async function forgotPassword(data) {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/forgotPassword",
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", "Mail sent to your email! You can close this tab");
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
}

export async function resetPassword(data, resetToken) {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/resetPassword/${resetToken}`,
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", "Password Changed Succesfully");
      window.setTimeout(() => {
        location.assign("/me");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
}
