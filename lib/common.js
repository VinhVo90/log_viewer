/**
* replace string start at an index
* @param {string} str
* @param {number} index
* @param {string} searchvalue
* @param {string} newvalue
*/
function stringReplaceAt(str, index, searchvalue, newvalue) {
  return str.substr(0, index) + str.substr(index).replace(searchvalue, newvalue);
}

module.exports = {
  stringReplaceAt,
};
