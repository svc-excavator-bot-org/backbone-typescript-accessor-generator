
var fs = require('fs'),
    us = require('underscore'),
  yaml = require('js-yaml'),
  path = require('path');

function mapHash(hash, mapper) {
  return Object.keys(hash).map(function(key){
    var value = hash[key];
    return mapper(key, value);
  });
}

function checkAndRemove(arr, val) {
  var index = arr.indexOf(val);
  if (index < 0) return false;
  arr.splice(index, 1);
  return true;
}

var primitives = ['string', 'bool', 'number'],
    for_backbone = true;

function generate_typescript(src, dest) {
  var models = yaml.safeLoad(fs.readFileSync(src, encoding='utf-8'));

  var normalized_models = mapHash(models, function(model_name, members){
    return {
      name: model_name,
      members: mapHash(members, function(member_name, member_def){
        var member_opts = member_def.split(' ');
        return {
          name: member_name,
          readonly: checkAndRemove(member_opts, 'readonly'),
          optional: checkAndRemove(member_opts, 'optional'),
          type: us.last(member_opts)
        };
      })
    };
  });

  var template = fs.readFileSync(__dirname + '/template.ts', encoding='utf-8');
  var output = us.template(template, {models: normalized_models, primitives: primitives});
  fs.writeFileSync(dest, output);
}

/*
TODO:
[ ] grunt plugin
[ ] use optimist https://github.com/substack/node-optimist
[ ] handle arrays (of primitives, models, and other?)
[ ] add usage to readme
[ ] add to npm
[ ] throw on additional fields
*/
