"use strict";
var TemplateCompiler = require("../htmlbars-compiler/compiler/template").TemplateCompiler;
var preprocess = require("../htmlbars-compiler/parser").preprocess;
var equalHTML = require("../test/support/assertions").equalHTML;
var DOMHelper = require("../morph").DOMHelper;

QUnit.module("TemplateCompiler");

var dom = new DOMHelper();

var hooks = {
  content: function(morph, helperName, context, params, options, env) {
    if (helperName === 'if') {
      if (context[params[0]]) {
        options.hooks = this;
        morph.update(options.render(context, env, morph.contextualElement));
      }
      return;
    }
    morph.update(context[helperName]);
  }
};

test("it works", function testFunction() {
  /* jshint evil: true */
  var ast = preprocess('<div>{{#if working}}Hello {{firstName}} {{lastName}}!{{/if}}</div>');
  var compiler = new TemplateCompiler();
  var program = compiler.compile(ast);
  var template = new Function("return " + program)();
  var env = {
    hooks: hooks,
    dom: dom
  };
  var frag = template(
    { working: true, firstName: 'Kris', lastName: 'Selden' },
    env,
    document.body
  );
  equalHTML(frag, '<div>Hello Kris Selden!</div>');
});