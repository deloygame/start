

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

// Имя переменной должно совпадать с тем, что вы укажете при выполнении команды в CLI
const TURNSTILE_SECRET = defineSecret("0x4AAAAAAD4HDX3AtqfTnh0QpKsRdHm6xK0");

exports.verifyTurnstile = onRequest(
  { secrets: [TURNSTILE_SECRET], cors: true }, // cors: true разрешает вызовы с вашего фронтенда
  async (req, res) => {

    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ success: false, error: "missing-token" });
    }

    try {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: TURNSTILE_SECRET.value(),
            response: token,
            remoteip: req.ip,
          }),
        }
      );
      const data = await verifyRes.json();
      return res.status(200).json({ success: data.success === true });
    } catch (err) {
      console.error("Turnstile verification failed:", err);
      return res.status(500).json({ success: false, error: "verification-error" });
    }
  }
);

