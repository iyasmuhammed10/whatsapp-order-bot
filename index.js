const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// ======================= CONFIG ==========================
const VERIFY_TOKEN = "mybot123";
const WHATSAPP_TOKEN = "EAAYuJRjm8JoBQL8cBbtg3trens93EyRA8KgkTgfQYX4gx98ba8VnZBXZBfLavI7LFQtmzapaNLZCDZB2EV6Y5F47BZAMFC2R6ZBZAp5T6ZBVvys73PlAT81SAixq9ZB1gWNu1YjWFOLuajfZBZCfSIufLkpQUvD5KWgIXSMRoEPdeeJelE6RwzBKYVt5CWP8KdxeFEYt6Jc9myyZATajH0ZAa803Tq1qj5ETRrWxwcoukCbxMx8213XKVNChetVV2VYHNVm6jIVdbBnWITyTug1e4A9onz9mm";
const PHONE_NUMBER_ID = "806507839223710";

// =========================================================

// Temporary storage (memory only)
let sessions = {};

function sendWhatsAppMessage(to, message) {
    return axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
            messaging_product: "whatsapp",
            to,
            text: { body: message }
        },
        {
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
}

// =========================================================
// VERIFY WEBHOOK (IMPORTANT)
// =========================================================

const express = require("express");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "mybot123";

// GET webhook for verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// POST webhook for messages
app.post("/webhook", (req, res) => {
  console.log("Incoming:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Root route
app.get("/", (req, res) => {
  res.send("WhatsApp bot is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// =========================================================
// RECEIVE WHATSAPP MESSAGES
// =========================================================

app.post("/webhook", async (req, res) => {
    try {
        const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (!entry) return res.sendStatus(200);

        const from = entry.from;
        const msg = entry.text?.body?.trim() || "";

        // Create new session
        if (!sessions[from]) {
            sessions[from] = { stage: "home", order: [], total: 0, address: "" };
        }

        const u = sessions[from];

        // ---- HOME ----
        if (u.stage === "home") {
            u.stage = "menu_choice";
            await sendWhatsAppMessage(
                from,
                "👋 Welcome!\nChoose an option:\n\n1️⃣ New Order\n2️⃣ Review\n3️⃣ Support"
            );
            return res.sendStatus(200);
        }

        // ---- MENU CHOICE ----
        if (u.stage === "menu_choice") {
            if (msg === "1") {
                u.stage = "choose_items";
                await sendWhatsAppMessage(
                    from,
                    "🍽️ Menu:\n1) Lunch Meal – ₹55\n2) Fish Fry – ₹40\n3) Omelette – ₹20\n\nSend numbers (1,2)"
                );
                return res.sendStatus(200);
            }

            if (msg === "2") {
                u.stage = "review";
                await sendWhatsAppMessage(from, "⭐ Please type your feedback:");
                return res.sendStatus(200);
            }

            if (msg === "3") {
                u.stage = "support";
                await sendWhatsAppMessage(from, "💬 Tell us your issue:");
                return res.sendStatus(200);
            }

            return sendWhatsAppMessage(from, "Choose 1, 2 or 3.");
        }

        // ---- REVIEW ----
        if (u.stage === "review") {
            u.stage = "home";
            await sendWhatsAppMessage(from, "🙏 Thank you for your feedback!");
            return res.sendStatus(200);
        }

        // ---- SUPPORT ----
        if (u.stage === "support") {
            u.stage = "home";
            await sendWhatsAppMessage(from, "✔️ Thank you. We will respond soon.");
            return res.sendStatus(200);
        }

        // ---- SELECT ITEMS ----
        if (u.stage === "choose_items") {
            const items = msg.split(",").map(i => i.trim());
            let selected = [];
            let total = 0;

            items.forEach(i => {
                if (i === "1") { selected.push("Lunch Meal ₹55"); total += 55; }
                if (i === "2") { selected.push("Fish Fry ₹40"); total += 40; }
                if (i === "3") { selected.push("Omelette ₹20"); total += 20; }
            });

            if (selected.length === 0) {
                return sendWhatsAppMessage(from, "❗ Invalid. Choose 1,2,3");
            }

            u.order = selected;
            u.total = total;
            u.stage = "collect_address";

            await sendWhatsAppMessage(
                from,
                `📝 Order:\n${selected.join("\n")}\nTotal: ₹${total}\n\n📍 Send your delivery address:`
            );
            return res.sendStatus(200);
        }

        // ---- ADDRESS ----
        if (u.stage === "collect_address") {
            u.address = msg;
            u.stage = "payment";

            await sendWhatsAppMessage(
                from,
                `✔️ Address Saved!\n\nOrder Summary:\n${u.order.join("\n")}\nTotal: ₹${u.total}\n\nChoose:\n1) GPay\n2) WhatsApp Pay\n3) Cash on Delivery\n4) Edit\n5) Cancel`
            );
            return res.sendStatus(200);
        }

        // ---- PAYMENT ----
        if (u.stage === "payment") {
            if (msg === "1") {
                u.stage = "home";
                await sendWhatsAppMessage(from, "🔗 GPay: https://gpay.fake.app");
                return res.sendStatus(200);
            }
            if (msg === "2") {
                u.stage = "home";
                await sendWhatsAppMessage(from, "🔗 WhatsApp Pay: https://wa.fake.pay");
                return res.sendStatus(200);
            }
            if (msg === "3") {
                u.stage = "home";
                await sendWhatsAppMessage(from, "✔️ COD confirmed. Thank you!");
                return res.sendStatus(200);
            }
            if (msg === "4") {
                u.stage = "choose_items";
                await sendWhatsAppMessage(from, "Edit your order: 1,2,3");
                return res.sendStatus(200);
            }
            if (msg === "5") {
                sessions[from] = { stage: "home", order: [] };
                await sendWhatsAppMessage(from, "❌ Order cancelled.");
                return res.sendStatus(200);
            }
        }

        return res.sendStatus(200);

    } catch (err) {
        console.error("Webhook Error:", err);
        return res.sendStatus(200);
    }
});

// =========================================================
// START SERVER
// =========================================================

app.listen(process.env.PORT || 3000, () => {
    console.log("WhatsApp bot running...");
});
