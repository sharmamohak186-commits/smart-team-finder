// "React, Node" -> ["React", "Node"]
function parseSkills(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// "react*, node, mongodb" -> [{name:"react", core:true}, {name:"node", core:false}, ...]
function parseRequiredSkills(str) {
  return parseSkills(str)
    .map((s) => (s.endsWith('*')
      ? { name: s.slice(0, -1).trim(), core: true }
      : { name: s, core: false }))
    .filter((s) => s.name);
}

module.exports = { parseSkills, parseRequiredSkills };
