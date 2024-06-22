var e, t, a, r;
function o() {
  let e = document.querySelector(".alert");
  null == e || e.parentElement.removeChild(e);
}
function s(e, t) {
  o();
  let a = `<div class="alert alert--${e}">${t}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", a),
    window.setTimeout(o, 2e3);
}
async function u(e, t) {
  try {
    let a = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: { email: e, password: t },
    });
    "success" === a.data.status &&
      (s("success", "Logged in successfully!"),
      window.setTimeout(() => {
        location.assign("/");
      }, 1e3));
  } catch (e) {
    s("error", e.response.data.message);
  }
}
async function n() {
  try {
    let e = await axios({ method: "GET", url: "/api/v1/users/logout" });
    "success" === e.data.status && location.reload(!0);
  } catch (e) {
    s("error", "Error logging out! Try again");
  }
}
async function c(e, t) {
  try {
    let a = `/api/v1/users/update${"password" === t ? "Password" : "Me"}`,
      r = await axios({ method: "PATCH", url: a, data: e });
    "success" === r.data.status &&
      s("success", `${t.toUpperCase()} Updated Successfully`);
  } catch (e) {
    s("error", e.response.data.message);
  }
}
null === (e = document.querySelector(".form--login")) ||
  void 0 === e ||
  e.addEventListener("submit", (e) => {
    e.preventDefault(),
      u(
        document.querySelector("#email").value,
        document.querySelector("#password").value
      );
  }),
  null === (t = document.querySelector(".nav__el--logout")) ||
    void 0 === t ||
    t.addEventListener("click", n),
  null === (a = document.querySelector(".form-user-data")) ||
    void 0 === a ||
    a.addEventListener("submit", (e) => {
      e.preventDefault();
      let t = new FormData();
      t.append("name", document.querySelector("#name").value),
        t.append("email", document.querySelector("#email").value),
        t.append("photo", document.querySelector("#photo").files[0]),
        c(t, "data");
    }),
  null === (r = document.querySelector(".form-user-password")) ||
    void 0 === r ||
    r.addEventListener("submit", async (e) => {
      e.preventDefault(),
        (document.querySelector(".btn--save-password").textContent =
          "Updating...");
      let t = document.querySelector("#password-current").value,
        a = document.querySelector("#password").value,
        r = document.querySelector("#password-confirm").value;
      await c(
        { passwordCurrent: t, password: a, passwordConfirm: r },
        "password"
      ),
        (document.querySelector(".btn--save-password").textContent =
          "Save password"),
        (document.querySelector("#password-current").value = ""),
        (document.querySelector("#password").value = ""),
        (document.querySelector("#password-confirm").value = "");
    });
//# sourceMappingURL=index.js.map
