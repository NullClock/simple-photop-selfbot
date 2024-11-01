const express = require("express");
const FormData = require("form-data");
const Socket = require("simple-socket-js");
const app = express();
const exotekAPI = "https://exotek.com/api/";
const data = {photop: {}};
const oauthData = {
  client_id: "62f8fac716d8eb8d2f6562ef",
  redirect_url: "https://example.org/handleExotekLogin", // fake redirect for no mssing params err
  response_type: "code",
  scope: "userinfo",
  state: "G8nQCcCIFpFVaS9tJkx9"
};
app.use(express.json());
app.get("/", async (req, res) => {
  const ss = new Socket({
    project_id: "61b9724ea70f1912d5e0eb11",
    project_token: "client_a05cd40e9f0d2b814249f06fbf97fe0f1d5"
  });
  const {tts} = req.query;

  await getExotekAccount();
  await oauthFinish();

  const reqq = await fetch(`https://api.photop.live/auth?ss=${ss.secureID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code: data.acode
    })
  });
  let ress;

  if (reqq.status == 200) {
    ress = await reqq.json();
    data.photop.account = ress.user;
    data.photop.userID = data.photop.account._id;
    data.photop.token = ress.token;

    let form = new FormData();
    form.append("data", JSON.stringify({
      text: tts
    }));

    const reqq2 = await fetch(`https://api.photop.live/posts/new`, {
      method: "POST",
      headers: {
        "auth": `${data.photop.userID};${data.photop.token.session}`,
        "content-type": "application/json"
      },
      body: form.toString()
    });
  }
});

async function getExotekAccount() {
  const reqq = await fetch(`${exotekAPI}signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "// nope",
      password: "// nope"
    })
  });
  let res;

  if (reqq.status == 200) {
    res = await reqq.json();
    data.userID = res.id;
    data.token = res.token;
  }
}

async function oauthFinish() {
  const reqq = await fetch(`${exotekAPI}oauth/finish`, {
    method: "POST",
    headers: {
      auth: `${data.userID};${data.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...oauthData
    })
  });
  let res;

  if (reqq.status == 200) {
    res = await reqq.json();

    data.acode = res.code;
  }
}
