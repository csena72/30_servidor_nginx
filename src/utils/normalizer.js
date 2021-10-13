const { Schema } = require("mongoose");
const { normalize, denormalize, schema } = require("normalizr");
const util = require("util");

normalizeMessages = (msgs) => {
  const userSchema = new schema.Entity("users");

  const entrySchema = new schema.Entity("entries", {
    author: userSchema,
  });
  const chatSchema = new schema.Entity("chat", {
    content: [entrySchema],
  });

  const normal = normalize(msgs, chatSchema);
  return normal;
};

function print(objeto) {
  console.log(util.inspect(objeto, false, 12, true));
}

module.exports = { normalizeMessages, print };
