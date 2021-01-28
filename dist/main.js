(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["DownZip"] = factory();
	else
		root["DownZip"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/downzip.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/service-worker-loader/lib/index.js!./src/downzip-sw.js":
/*!********************************************************************!*\
  !*** ./node_modules/service-worker-loader/lib!./src/downzip-sw.js ***!
  \********************************************************************/
/*! exports provided: ServiceWorkerNoSupportError, scriptUrl, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"ServiceWorkerNoSupportError\", function() { return ServiceWorkerNoSupportError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"scriptUrl\", function() { return scriptUrl; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return registerServiceWorkerIfSupported; });\nvar ServiceWorkerNoSupportError = (function() {\n\n\tfunction ServiceWorkerNoSupportError() {\n\t\tvar err = Error.call(this, 'ServiceWorker is not supported.');\n\t\tObject.setPrototypeOf(err, ServiceWorkerNoSupportError.prototype);\n\t\treturn err;\n\t}\n\n\tServiceWorkerNoSupportError.prototype = Object.create(Error.prototype);\n\n\treturn ServiceWorkerNoSupportError;\n})();\n\nvar scriptUrl = \"/\" + \"downzip-sw.js\";\n\nfunction registerServiceWorkerIfSupported(options) {\n\n\tif ('serviceWorker' in navigator) {\n\t\treturn navigator.serviceWorker.register(scriptUrl, options);\n\t}\n\n\treturn Promise.reject(new ServiceWorkerNoSupportError());\n}\n\n\n//# sourceURL=webpack://DownZip/./src/downzip-sw.js?./node_modules/service-worker-loader/lib");

/***/ }),

/***/ "./src/WorkerUtils.js":
/*!****************************!*\
  !*** ./src/WorkerUtils.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nvar DEBUG = false;\n\nvar WorkerUtils = function WorkerUtils(name) {\n  var _this = this;\n\n  _classCallCheck(this, WorkerUtils);\n\n  _defineProperty(this, \"error\", function (message) {\n    console.error(\"[\".concat(_this.name, \"] \").concat(message));\n  });\n\n  _defineProperty(this, \"log\", function (message) {\n    DEBUG && console.log(\"[\".concat(_this.name, \"] \").concat(message));\n  });\n\n  this.name = name;\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (WorkerUtils);\n\n//# sourceURL=webpack://DownZip/./src/WorkerUtils.js?");

/***/ }),

/***/ "./src/downzip.js":
/*!************************!*\
  !*** ./src/downzip.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var service_worker_loader_downzip_sw__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! service-worker-loader!./downzip-sw */ \"./node_modules/service-worker-loader/lib/index.js!./src/downzip-sw.js\");\n/* harmony import */ var _WorkerUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WorkerUtils */ \"./src/WorkerUtils.js\");\nfunction asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\nvar Utils = new _WorkerUtils__WEBPACK_IMPORTED_MODULE_1__[\"default\"]('DownZip-Main');\nvar SCOPE = 'downzip';\nvar TIMEOUT_MS = 5000;\nvar KEEPALIVE_INTERVAL_MS = 5000;\n\nvar DownZip = /*#__PURE__*/function () {\n  function DownZip() {\n    _classCallCheck(this, DownZip);\n\n    this.worker = null;\n  }\n\n  _createClass(DownZip, [{\n    key: \"register\",\n    value: function () {\n      var _register = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {\n        var _this = this;\n\n        var options,\n            defaultMapScriptUrl,\n            mapScriptUrl,\n            _args2 = arguments;\n        return regeneratorRuntime.wrap(function _callee2$(_context2) {\n          while (1) {\n            switch (_context2.prev = _context2.next) {\n              case 0:\n                options = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};\n\n                // Allow passing mapScriptUrl to service-worker-loader\n                defaultMapScriptUrl = function defaultMapScriptUrl(scriptUrl) {\n                  return scriptUrl;\n                };\n\n                mapScriptUrl = options.mapScriptUrl || defaultMapScriptUrl; // Register service worker and let it intercept our scope\n\n                _context2.next = 5;\n                return Object(service_worker_loader_downzip_sw__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(mapScriptUrl, {\n                  scope: \"./\".concat(SCOPE, \"/\")\n                }).then(function (result) {\n                  Utils.log('[DownZip] Service worker registered successfully:', result);\n                  _this.worker = result.installing || result.active;\n                })[\"catch\"](function (error) {\n                  Utils.error('[DownZip] Service workers not loaded:', error);\n                });\n\n              case 5:\n                // Start keep-alive timer\n                setInterval( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {\n                  return regeneratorRuntime.wrap(function _callee$(_context) {\n                    while (1) {\n                      switch (_context.prev = _context.next) {\n                        case 0:\n                          _this.sendMessage('TICK');\n\n                        case 1:\n                        case \"end\":\n                          return _context.stop();\n                      }\n                    }\n                  }, _callee);\n                })), KEEPALIVE_INTERVAL_MS);\n\n              case 6:\n              case \"end\":\n                return _context2.stop();\n            }\n          }\n        }, _callee2);\n      }));\n\n      function register() {\n        return _register.apply(this, arguments);\n      }\n\n      return register;\n    }()\n  }, {\n    key: \"sendMessage\",\n    value: function sendMessage(command, data, port) {\n      this.worker.postMessage({\n        command: command,\n        data: data\n      }, port ? [port] : undefined);\n    } // Files array is in the following format: [{name: '', downloadUrl: '', size: 0}, ...]\n\n  }, {\n    key: \"downzip\",\n    value: function () {\n      var _downzip = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(id, name, files) {\n        var _this2 = this;\n\n        return regeneratorRuntime.wrap(function _callee3$(_context3) {\n          while (1) {\n            switch (_context3.prev = _context3.next) {\n              case 0:\n                if (this.worker) {\n                  _context3.next = 3;\n                  break;\n                }\n\n                Utils.error(\"[DownZip] No service worker registered!\");\n                return _context3.abrupt(\"return\");\n\n              case 3:\n                return _context3.abrupt(\"return\", new Promise(function (resolve, reject) {\n                  // Return download URL on acknowledge via messageChannel\n                  var messageChannel = new MessageChannel();\n                  messageChannel.port1.addEventListener('message', function () {\n                    return resolve(\"\".concat(SCOPE, \"/download-\").concat(id));\n                  });\n                  messageChannel.port1.start(); // Init this task in our service worker\n\n                  _this2.sendMessage('INITIALIZE', {\n                    id: id,\n                    files: files,\n                    name: name\n                  }, messageChannel.port2); // Start timeout timer\n\n\n                  setTimeout(reject, TIMEOUT_MS);\n                }));\n\n              case 4:\n              case \"end\":\n                return _context3.stop();\n            }\n          }\n        }, _callee3, this);\n      }));\n\n      function downzip(_x, _x2, _x3) {\n        return _downzip.apply(this, arguments);\n      }\n\n      return downzip;\n    }()\n  }]);\n\n  return DownZip;\n}();\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (DownZip);\n\n//# sourceURL=webpack://DownZip/./src/downzip.js?");

/***/ })

/******/ });
});