import { showAlert } from "./alerts";

export async function updateSettings(data, type) {
  try {
    const url = `/api/v1/users/update${
      type === "password" ? "Password" : "Me"
    }`;

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });

    if (res.data.status === "success")
      showAlert("success", `${type.toUpperCase()} Updated Successfully`);
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
}
