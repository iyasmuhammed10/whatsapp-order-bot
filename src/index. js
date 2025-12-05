const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Temporary storage (reset if server restarts)
let userOrders = {};

function send(message) {
    return { reply: message };
}

app.post("/bot", (req, res) => {
    const msg = req.body.message?.trim() || "";
    const user = req.body.sender || "unknown";

    if (!userOrders[user]) {
        userOrders[user] = { stage: "home", order: [], address: "" };
    }

    const u = userOrders[user];

    // ---- HOME SCREEN ----
    if (u.stage === "home") {
        u.stage = "await_home_choice";
        return res.json(send(
            "👋 Welcome! Please choose an option:\n\n1️⃣ Place a new order\n2️⃣ Give feedback\n3️⃣ Support"
        ));
    }

    // ---- HOME OPTION SELECT ----
    if (u.stage === "await_home_choice") {
        if (msg === "1") {
            u.stage = "choose_items";
            return res.json(send(
                "🍽️ Menu:\n\n1) Lunch Meal – ₹55\n2) Fish Fry – ₹40\n3) Omelette – ₹20\n\nSend item numbers separated by comma (example: 1,3)"
            ));
        }

        if (msg === "2") {
            u.stage = "review";
            return res.json(send(
                "⭐ Please share your feedback. Type your message below:"
            ));
        }

        if (msg === "3") {
            u.stage = "help";
            return res.json(send(
                "❗ Tell us your issue, we’ll assist you right away:"
            ));
        }

        return res.json(send("Please choose 1, 2, or 3."));
    }

    // ---- FEEDBACK ----
    if (u.stage === "review") {
        u.stage = "home";
        return res.json(send("🙏 Thanks for your feedback!"));
    }

    // ---- HELP ----
    if (u.stage === "help") {
        u.stage = "home";
        return res.json(send("💬 Thanks for the details. We'll get back shortly."));
    }

    // ---- ITEM SELECTION ----
    if (u.stage === "choose_items") {
        const items = msg.split(",").map(x => x.trim());

        let selected = [];
        let total = 0;

        items.forEach(i => {
            if (i === "1") { selected.push("Lunch Meal ₹55"); total += 55; }
            if (i === "2") { selected.push("Fish Fry ₹40"); total += 40; }
            if (i === "3") { selected.push("Omelette ₹20"); total += 20; }
        });

        if (selected.length === 0) {
            return res.json(send("Invalid selection. Choose 1,2,3 (comma separated)."));
        }

        u.order = selected;
        u.total = total;
        u.stage = "request_address";

        return res.json(send(
            `📝 Your order:\n${selected.join("\n")}\n\nTotal: ₹${total}\n\nPlease send your delivery address or share location.`
        ));
    }

    // ---- ADDRESS COLLECTION ----
    if (u.stage === "request_address") {
        u.address = msg;
        u.stage = "payment";

        return res.json(send(
            `📍 Address Saved.\n\nOrder Summary:\n${u.order.join("\n")}\nTotal: ₹${u.total}\n\nChoose:\n1️⃣ Pay via GPay\n2️⃣ WhatsApp Pay\n3️⃣ Cash on Delivery\n4️⃣ Edit Order\n5️⃣ Cancel`
        ));
    }

    // ---- PAYMENT / EDIT ----
    if (u.stage === "payment") {
        if (msg === "1") {
            u.stage = "home";
            return res.json(send("🔗 GPay Link:\nhttps://gpay.app.fake-link"));
        }

        if (msg === "2") {
            u.stage = "home";
            return res.json(send("🔗 WhatsApp Pay link:\nhttps://wa.pay.fake-link"));
        }

        if (msg === "3") {
            u.stage = "home";
            return res.json(send("👍 Order confirmed as COD. Thank you!"));
        }

        if (msg === "4") {
            u.stage = "choose_items";
            return res.json(send(
                "✔️ Edit your order:\n1) Lunch Meal\n2) Fish\n3) Omelette\n\nSend items (e.g., 1,2)"
            ));
        }

        if (msg === "5") {
            u.stage = "home";
            u.order = [];
            return res.json(send("❌ Order cancelled."));
        }

        return res.json(send("Please choose 1–5."));
    }

    return res.json(send("Restarting..."));
});

// Render Port
app.listen(process.env.PORT || 3000, () => {
    console.log("Bot running");
});
