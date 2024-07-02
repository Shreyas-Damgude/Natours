import { showAlert } from "./alerts";

export async function bookTour(data) {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/bookings`,
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", "Tour booked!");
      window.setTimeout(() => {
        location.assign("/my-bookings");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
}
