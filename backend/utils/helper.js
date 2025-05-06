// import crypto from "crypto";

const crypto = require("crypto");

function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateHmacSha256Hash(data, secret) {
  if (!data || !secret) {
    throw new Error("Both data and secret are required to generate a hash.");
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64");

  return hash;
}

module.exports = {
  generateUniqueId,
  generateHmacSha256Hash,
};
