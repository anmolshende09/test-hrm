// Replaces {{variable_name}} placeholders with supplied values.
// Unresolved placeholders are left as-is (not blanked out) so it's obvious
// in the merged output what still needs a value.
const mergeTemplate = (content, values = {}) => {
  if (!content) return "";
  return content.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    const value = values[key];
    return value !== undefined && value !== null && value !== "" ? String(value) : match;
  });
};

module.exports = { mergeTemplate };