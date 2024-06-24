import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
import { signup } from "./signup";

// Delegation
document.querySelector(".form--login")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  login(email, password);
});

document.querySelector(".form--signup")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.querySelector("#name").value;
  const email = document.querySelector("#email").value;
  const role = document.querySelector("#role").value.toLowerCase();
  const password = document.querySelector("#password").value;
  const passwordConfirm = document.querySelector("#password-confirm").value;

  signup({ name, email, role, password, passwordConfirm });
});

document.querySelector(".nav__el--logout")?.addEventListener("click", logout);

document.querySelector(".form-user-data")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData();
  form.append("name", document.querySelector("#name").value);
  form.append("email", document.querySelector("#email").value);
  form.append("photo", document.querySelector("#photo").files[0]);

  updateSettings(form, "data");
});

document
  .querySelector(".form-user-password")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";
    const passwordCurrent = document.querySelector("#password-current").value;
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#password-confirm").value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );

    document.querySelector(".btn--save-password").textContent = "Save password";
    document.querySelector("#password-current").value = "";
    document.querySelector("#password").value = "";
    document.querySelector("#password-confirm").value = "";
  });
