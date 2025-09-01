import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { file } = req.body; // base64 image string
    if (!file) throw new Error("No file provided");

    // Convert base64 to Buffer
    const buffer = Buffer.from(file, "base64");

    // Prepare FormData for Catbox
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("userhash", ""); // leave empty for anonymous
    formData.append("fileToUpload", buffer, { filename: "image.png" });

    // Upload to Catbox
    const catboxRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData
    });

    const url = await catboxRes.text();
    if (!url.startsWith("http")) throw new Error("Invalid response from Catbox");

    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
